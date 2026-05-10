// src/components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { BrandMark } from "./BrandMark";
import { signOutUser, syncEmails, fetchInboxData, fetchSentData, fetchFullEmail, trashEmailAPI, archiveEmailAPI, replyToEmailAPI, sendNewEmailAPI } from "../firebase/config"; 
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const initialData = {
  columns: {
    todo: { id: "todo", title: "To Do 📝", taskIds: [] },
    "in-progress": { id: "in-progress", title: "In Progress ⏳", taskIds: [] },
    done: { id: "done", title: "Done ✅", taskIds: [] },
  },
  tasks: {},
  columnOrder: ["todo", "in-progress", "done"],
};

export function Dashboard({ user }) {
  const [signingOut, setSigningOut] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [boardData, setBoardData] = useState(initialData);
  
  const [activeFolder, setActiveFolder] = useState("inbox"); 
  const [inboxEmails, setInboxEmails] = useState([]);
  const [sentEmails, setSentEmails] = useState([]);
  const [loadingMails, setLoadingMails] = useState(false);
  
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [fullEmailBody, setFullEmailBody] = useState(""); 
  const [loadingBody, setLoadingBody] = useState(false);
  
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [isComposing, setIsComposing] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOutUser();
  };

  const handleRefreshMails = async () => {
    setLoadingMails(true);
    try {
      const [inbox, sent] = await Promise.all([fetchInboxData(), fetchSentData()]);
      setInboxEmails(inbox);
      setSentEmails(sent);
    } catch (error) { console.error("Refresh error", error); } 
    finally { setLoadingMails(false); }
  };

  useEffect(() => {
    handleRefreshMails(); 

    const loadTasks = () => {
      const savedBoard = localStorage.getItem("mailwareBoardData");
      if (savedBoard) {
        setBoardData(JSON.parse(savedBoard));
        return;
      }
      const savedTasks = localStorage.getItem("aiTasks");
      if (savedTasks) {
        try {
          const parsedTasks = JSON.parse(savedTasks);
          const newTasksObj = {};
          const newTaskIds = [];
          parsedTasks.forEach((task, index) => {
            const taskId = task.id || `ai-task-${index}`;
            newTasksObj[taskId] = { id: taskId, title: task.title, deadline: task.deadline, priority: task.priority, source: task.source || task.sourceEmail };
            newTaskIds.push(taskId); 
          });
          const freshBoardState = { ...initialData, tasks: newTasksObj, columns: { ...initialData.columns, todo: { ...initialData.columns.todo, taskIds: newTaskIds } } };
          setBoardData(freshBoardState);
          localStorage.setItem("mailwareBoardData", JSON.stringify(freshBoardState));
        } catch (error) {}
      }
    };
    loadTasks();
    
    window.addEventListener("tasksUpdated", loadTasks);
    return () => window.removeEventListener("tasksUpdated", loadTasks);
  }, []);

  useEffect(() => {
    if (selectedEmail) {
      setIsComposing(false);
      setLoadingBody(true);
      setFullEmailBody("");
      setReplyText("");
      
      // OPTIONAL: Yahan UI mein local state me read mark kar sakte hain
      if (activeFolder === "inbox" && selectedEmail.isUnread) {
          setInboxEmails(prev => prev.map(e => e.id === selectedEmail.id ? { ...e, isUnread: false } : e));
      }

      fetchFullEmail(selectedEmail.id)
        .then((body) => { setFullEmailBody(body); setLoadingBody(false); })
        .catch(() => { setFullEmailBody("<p style='color:red;'>Failed to load content.</p>"); setLoadingBody(false); });
    }
  }, [selectedEmail, activeFolder]);

  const doSync = async () => { 
    setIsSyncing(true);
    try {
      const fetchedTasks = await syncEmails(user.email);
      let newTasksAdded = 0;
      const updatedTasks = { ...boardData.tasks };
      const newTodoIds = [...boardData.columns.todo.taskIds];
      fetchedTasks.forEach((task, index) => {
        const taskId = task.id || `ai-task-${Date.now()}-${index}`;
        if (!updatedTasks[taskId]) {
          updatedTasks[taskId] = { id: taskId, title: task.title, deadline: task.deadline, priority: task.priority, source: task.source || task.sourceEmail };
          newTodoIds.unshift(taskId); 
          newTasksAdded++;
        }
      });
      if (newTasksAdded > 0) {
        const newBoardState = { ...boardData, tasks: updatedTasks, columns: { ...boardData.columns, todo: { ...boardData.columns.todo, taskIds: newTodoIds } } };
        setBoardData(newBoardState);
        localStorage.setItem("mailwareBoardData", JSON.stringify(newBoardState));
      }
    } catch (error) { alert("Sync failed."); } 
    finally { setIsSyncing(false); }
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const startCol = boardData.columns[source.droppableId];
    const finishCol = boardData.columns[destination.droppableId];
    let newBoardState;
    if (startCol === finishCol) {
      const newTaskIds = Array.from(startCol.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      const newCol = { ...startCol, taskIds: newTaskIds };
      newBoardState = { ...boardData, columns: { ...boardData.columns, [newCol.id]: newCol } };
    } else {
      const startTaskIds = Array.from(startCol.taskIds);
      startTaskIds.splice(source.index, 1);
      const newStart = { ...startCol, taskIds: startTaskIds };
      const finishTaskIds = Array.from(finishCol.taskIds);
      finishTaskIds.splice(destination.index, 0, draggableId);
      const newFinish = { ...finishCol, taskIds: finishTaskIds };
      newBoardState = { ...boardData, columns: { ...boardData.columns, [newStart.id]: newStart, [newFinish.id]: newFinish } };
    }
    setBoardData(newBoardState);
    localStorage.setItem("mailwareBoardData", JSON.stringify(newBoardState));
  };

  const handleArchive = async () => {
    setIsActionLoading(true);
    try {
        await archiveEmailAPI(selectedEmail.id);
        setInboxEmails(inboxEmails.filter(e => e.id !== selectedEmail.id)); 
        setSelectedEmail(null); 
    } catch (error) { alert("Failed to archive"); }
    setIsActionLoading(false);
  };

  const handleDelete = async () => {
    setIsActionLoading(true);
    try {
        await trashEmailAPI(selectedEmail.id);
        setInboxEmails(inboxEmails.filter(e => e.id !== selectedEmail.id)); 
        setSentEmails(sentEmails.filter(e => e.id !== selectedEmail.id)); 
        setSelectedEmail(null); 
    } catch (error) { alert("Failed to delete"); }
    setIsActionLoading(false);
  };

  const handleSendReply = async () => {
      if(!replyText.trim()) return;
      setIsSendingReply(true);
      try {
          await replyToEmailAPI(selectedEmail.id, replyText);
          setReplyText("");
          alert("✅ Reply Sent Successfully!");
          handleRefreshMails(); 
      } catch (error) { alert("Failed to send reply"); }
      setIsSendingReply(false);
  };

  const handleSendCompose = async () => {
    if(!composeData.to || !composeData.body) return alert("To and Message fields are required!");
    setIsActionLoading(true);
    try {
        await sendNewEmailAPI(composeData.to, composeData.subject, composeData.body);
        alert("✅ Email Sent Successfully!");
        setComposeData({ to: '', subject: '', body: '' }); 
        setIsComposing(false); 
        handleRefreshMails(); 
    } catch (error) { alert("Failed to send email"); }
    setIsActionLoading(false);
  };

  const getPriorityColor = (p) => p?.toLowerCase() === 'high' ? '#fce8e8' : p?.toLowerCase() === 'medium' ? '#fef3c7' : '#e6f4ea';
  const getPriorityTextColor = (p) => p?.toLowerCase() === 'high' ? '#c5221f' : p?.toLowerCase() === 'medium' ? '#b08800' : '#137333';

  const currentListToDisplay = activeFolder === "inbox" ? inboxEmails : sentEmails;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f8f9fa", fontFamily: "'Google Sans', sans-serif" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", background: "#fff", borderBottom: "1px solid #e8eaed", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <BrandMark size={32} color="#1a73e8" radius={8} />
          <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#202124", margin: 0 }}>Mailware</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {user?.photoURL && <img src={user.photoURL} alt="User" style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #e8eaed" }} />}
          <button onClick={handleSignOut} disabled={signingOut} style={{ padding: "8px 20px", fontSize: 13, fontWeight: "500", background: "transparent", border: "1px solid #dadce0", borderRadius: 20, cursor: "pointer", color: "#5f6368" }}>
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexGrow: 1, overflow: "hidden", width: "100%" }}>
        
        {/* ─── LEFT PANE: MAILS LIST ─── */}
        <div style={{ width: "380px", minWidth: "380px", maxWidth: "380px", flexShrink: 0, background: "#fff", borderRight: "1px solid #e8eaed", display: "flex", flexDirection: "column", zIndex: 5 }}>
            
            <div style={{ padding: "16px", borderBottom: "1px solid #e8eaed", background: "#fff" }}>
                 <button 
                    onClick={() => { setIsComposing(true); setSelectedEmail(null); }}
                    style={{ width: "100%", padding: "12px", background: "#c2e7ff", color: "#001d35", border: "none", borderRadius: "16px", fontWeight: "600", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", transition: "background 0.2s" }}
                 >
                    <span>✏️</span> Compose New Mail
                 </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px", borderBottom: "1px solid #e8eaed", background: "#fbfbfb" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                        onClick={() => { setActiveFolder("inbox"); setSelectedEmail(null); }}
                        style={{ padding: "6px 12px", border: "none", background: activeFolder === "inbox" ? "#e8eaed" : "transparent", borderRadius: "16px", fontWeight: "600", color: activeFolder === "inbox" ? "#202124" : "#5f6368", cursor: "pointer", fontSize: "13px" }}>
                        📥 Inbox
                    </button>
                    <button 
                        onClick={() => { setActiveFolder("sent"); setSelectedEmail(null); }}
                        style={{ padding: "6px 12px", border: "none", background: activeFolder === "sent" ? "#e8eaed" : "transparent", borderRadius: "16px", fontWeight: "600", color: activeFolder === "sent" ? "#202124" : "#5f6368", cursor: "pointer", fontSize: "13px" }}>
                        📤 Sent
                    </button>
                </div>
                <button onClick={handleRefreshMails} disabled={loadingMails} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "16px", padding: "4px" }} title="Refresh Mails">
                    {loadingMails ? "⏳" : "🔄"}
                </button>
            </div>
            
            <div style={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden" }}>
                {loadingMails ? (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: "#5f6368", fontSize: "14px" }}>Loading {activeFolder}... ⏳</div>
                ) : currentListToDisplay.length === 0 ? (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: "#5f6368", fontSize: "14px" }}>No emails here.</div>
                ) : (
                    currentListToDisplay.map((email, i) => (
                        <div key={i} onClick={() => setSelectedEmail(email)}
                            style={{ 
                                padding: "16px 20px", borderBottom: "1px solid #f1f3f4", cursor: "pointer",
                                background: selectedEmail?.id === email.id ? "#e8f0fe" : (email.isUnread ? "#fff" : "#fafafa"),
                                borderLeft: selectedEmail?.id === email.id ? "4px solid #1a73e8" : "4px solid transparent",
                                transition: "background 0.2s",
                                display: "flex", gap: "10px", alignItems: "flex-start" 
                            }}>
                            
                            <div style={{ 
                                width: "8px", height: "8px", borderRadius: "50%", 
                                background: email.isUnread ? "#1a73e8" : "transparent", 
                                marginTop: "6px", flexShrink: 0 
                            }}></div>

                            <div style={{ flexGrow: 1, overflow: "hidden" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                    <span style={{ fontWeight: email.isUnread ? "700" : "500", color: email.isUnread ? "#202124" : "#5f6368", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>
                                        {activeFolder === "inbox" ? email.from : `To: ${email.to}`}
                                    </span>
                                    <span style={{ fontSize: "11px", color: email.isUnread ? "#1a73e8" : "#80868b", fontWeight: email.isUnread ? "700" : "500", flexShrink: 0 }}>{email.date.split(' ')[1]} {email.date.split(' ')[2]}</span>
                                </div>
                                <div style={{ fontWeight: email.isUnread ? "700" : "500", color: email.isUnread ? "#202124" : "#5f6368", fontSize: "13px", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email.subject}</div>
                                
                                {/* 🔥 YAHAN CSS CHANGE KI HAI: textOverflow aur nowrap hata diya, aur lineHeight badha di */}
                                <div style={{ color: "#616161", fontSize: "12.5px", lineHeight: "1.5", marginTop: "6px", wordWrap: "break-word" }}>
                                    {email.snippet}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* ─── RIGHT PANE: DYNAMIC (COMPOSE, READ VIEW or KANBAN BOARD) ─── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "#f6f8fc", overflow: "hidden" }}>
            
            {isComposing ? (
                 <div style={{ padding: "40px", background: "#fff", height: "100%", overflowY: "auto", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #e8eaed" }}>
                        <h2 style={{ fontSize: "20px", color: "#202124", margin: 0 }}>New Message</h2>
                        <button onClick={() => setIsComposing(false)} style={{ padding: "8px 16px", background: "#f1f3f4", color: "#3c4043", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}>✖ Discard</button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", flexGrow: 1 }}>
                        <div style={{ display: "flex", borderBottom: "1px solid #e8eaed", paddingBottom: "8px" }}>
                            <span style={{ color: "#5f6368", width: "80px", paddingTop: "8px" }}>To:</span>
                            <input type="email" value={composeData.to} onChange={(e) => setComposeData({...composeData, to: e.target.value})} placeholder="recipient@example.com" style={{ flexGrow: 1, border: "none", outline: "none", fontSize: "15px", padding: "8px 0" }} />
                        </div>
                        <div style={{ display: "flex", borderBottom: "1px solid #e8eaed", paddingBottom: "8px" }}>
                            <span style={{ color: "#5f6368", width: "80px", paddingTop: "8px" }}>Subject:</span>
                            <input type="text" value={composeData.subject} onChange={(e) => setComposeData({...composeData, subject: e.target.value})} placeholder="Email Subject" style={{ flexGrow: 1, border: "none", outline: "none", fontSize: "15px", padding: "8px 0" }} />
                        </div>
                        <textarea value={composeData.body} onChange={(e) => setComposeData({...composeData, body: e.target.value})} placeholder="Write your message here..." style={{ flexGrow: 1, border: "none", outline: "none", resize: "none", fontSize: "15px", fontFamily: "inherit", marginTop: "16px", minHeight: "300px" }} />
                    </div>

                    <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #e8eaed", display: "flex" }}>
                        <button onClick={handleSendCompose} disabled={isActionLoading || !composeData.to || !composeData.body} style={{ padding: "12px 32px", background: (isActionLoading || !composeData.to || !composeData.body) ? "#e8eaed" : "#1a73e8", color: (isActionLoading || !composeData.to || !composeData.body) ? "#9aa0a6" : "#fff", border: "none", borderRadius: "24px", cursor: (isActionLoading || !composeData.to || !composeData.body) ? "not-allowed" : "pointer", fontWeight: "600", fontSize: "14px", transition: "background 0.2s" }}>
                            {isActionLoading ? "Sending..." : "Send Message 🚀"}
                        </button>
                    </div>
                 </div>
            ) : selectedEmail ? (
                <div style={{ padding: "40px", background: "#fff", height: "100%", overflowY: "auto", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #e8eaed" }}>
                        <button onClick={() => setSelectedEmail(null)} style={{ padding: "8px 16px", background: "#f1f3f4", color: "#3c4043", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}><span>←</span> Back</button>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button onClick={handleArchive} disabled={isActionLoading} style={{ padding: "8px 16px", background: "#fff", color: "#3c4043", border: "1px solid #dadce0", borderRadius: "8px", cursor: isActionLoading ? "not-allowed" : "pointer", fontWeight: "500" }}>📥 Archive</button>
                            <button onClick={handleDelete} disabled={isActionLoading} style={{ padding: "8px 16px", background: "#fff", color: "#d93025", border: "1px solid #fce8e8", borderRadius: "8px", cursor: isActionLoading ? "not-allowed" : "pointer", fontWeight: "500" }}>🗑️ Trash</button>
                        </div>
                    </div>
                    
                    <h1 style={{ fontSize: "24px", color: "#202124", marginBottom: "8px" }}>{selectedEmail.subject}</h1>
                    <div style={{ color: "#5f6368", fontSize: "14px", marginBottom: "24px" }}>
                        {activeFolder === "inbox" ? ( <>From: <strong style={{color: "#202124"}}>{selectedEmail.from}</strong></> ) : ( <>To: <strong style={{color: "#202124"}}>{selectedEmail.to}</strong></> )} • {selectedEmail.date}
                    </div>

                    <div style={{ flexGrow: 1, background: "#fafafa", padding: "24px", borderRadius: "12px", border: "1px solid #f1f3f4", overflowX: "auto", marginBottom: "24px" }}>
                        {loadingBody ? <div style={{ color: "#5f6368", textAlign: "center", marginTop: "20px" }}>Fetching email contents... ⏳</div> : <div style={{ color: "#202124", fontSize: "14px", lineHeight: "1.6" }} dangerouslySetInnerHTML={{ __html: fullEmailBody }} />}
                    </div>

                    <div style={{ background: "#fff", border: "1px solid #dadce0", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                        <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your reply here..." style={{ width: "100%", minHeight: "100px", border: "none", outline: "none", resize: "none", fontSize: "14px", color: "#202124", fontFamily: "inherit" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f1f3f4" }}>
                            <span style={{ fontSize: "12px", color: "#80868b" }}>Powered by Mailware APIs</span>
                            <button onClick={handleSendReply} disabled={isSendingReply || !replyText.trim()} style={{ padding: "10px 24px", background: (isSendingReply || !replyText.trim()) ? "#e8eaed" : "#1a73e8", color: (isSendingReply || !replyText.trim()) ? "#9aa0a6" : "#fff", border: "none", borderRadius: "20px", cursor: (isSendingReply || !replyText.trim()) ? "not-allowed" : "pointer", fontWeight: "600", fontSize: "13px", transition: "background 0.2s" }}>
                                {isSendingReply ? "Sending..." : "Send Reply 🚀"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div style={{ padding: "24px 32px 16px 32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexShrink: 0 }}>
                      <div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#202124", margin: "0 0 8px 0" }}>Your AI Task Board</h2>
                        <div style={{ display: "inline-block", background: "#e8f0fe", color: "#1557b0", padding: "6px 12px", borderRadius: "16px", fontSize: "12px", fontWeight: "500" }}>✦ Automatically extracted from Inbox</div>
                      </div>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                      <div style={{ display: "flex", gap: "24px", padding: "16px 32px 32px 32px", overflowX: "auto", flexGrow: 1, alignItems: "flex-start" }}>
                        {boardData.columnOrder.map((columnId) => {
                          const column = boardData.columns[columnId];
                          const tasks = column.taskIds.map((taskId) => boardData.tasks[taskId]);

                          return (
                            <div key={column.id} style={{ background: "#e4e8ec", borderRadius: "12px", width: "320px", flexShrink: 0, display: "flex", flexDirection: "column", maxHeight: "100%" }}>
                              <div style={{ padding: "16px", fontWeight: "600", color: "#3c4043", display: "flex", justifyContent: "space-between" }}>
                                {column.title}
                                <span style={{ background: "#d1d6dc", padding: "2px 8px", borderRadius: "12px", fontSize: "12px", color:"#3c4043" }}>{tasks.length}</span>
                              </div>

                              <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                  <div ref={provided.innerRef} {...provided.droppableProps} style={{ padding: "0 16px 16px 16px", flexGrow: 1, overflowY: "auto", minHeight: "150px", transition: "background 0.2s ease", borderRadius: "0 0 12px 12px", background: snapshot.isDraggingOver ? "#d3e3fd" : "transparent" }}>
                                    {tasks.map((task, index) => (
                                      <Draggable key={task.id} draggableId={task.id} index={index}>
                                        {(provided, snapshot) => (
                                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{ userSelect: "none", padding: "16px", margin: "0 0 12px 0", backgroundColor: "#fff", color: "#202124", borderRadius: "8px", boxShadow: snapshot.isDragging ? "0 8px 16px rgba(0,0,0,0.15)" : "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #dadce0", ...provided.draggableProps.style }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                              <span style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", padding: "4px 8px", borderRadius: "4px", background: getPriorityColor(task.priority), color: getPriorityTextColor(task.priority) }}>{task.priority || "Low"}</span>
                                            </div>
                                            <div style={{ fontSize: "14px", fontWeight: "600", lineHeight: "1.4", marginBottom: "12px" }}>{task.title}</div>
                                            <div style={{ fontSize: "11px", color: "#5f6368", display: "flex", flexDirection: "column", gap: "4px" }}>
                                              {task.deadline && <div>🕒 {task.deadline}</div>}
                                              {task.source && <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>👤 {task.source}</div>}
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          );
                        })}
                      </div>
                    </DragDropContext>
                </>
            )}
        </div>
      </div>
    </div>
  );
}