// src/components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { BrandMark } from "./BrandMark";
import { signOutUser, syncEmails, fetchInboxData, fetchSentData, fetchFullEmail, trashEmailAPI, archiveEmailAPI, replyToEmailAPI, sendNewEmailAPI } from "../firebase/config"; 
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const initialData = {
  columns: {
    todo: { id: "todo", title: "To Do 📝", taskIds: [] },
    done: { id: "done", title: "Done ✅", taskIds: [] },
  },
  tasks: {},
  columnOrder: ["todo", "done"], 
};

export function Dashboard({ user }) {
  const [signingOut, setSigningOut] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [boardData, setBoardData] = useState(initialData);
  
  const [activeFolder, setActiveFolder] = useState("inbox"); 
  
  const [inboxEmails, setInboxEmails] = useState([]);
  const [inboxNextPage, setInboxNextPage] = useState(null);
  
  const [sentEmails, setSentEmails] = useState([]);
  const [sentNextPage, setSentNextPage] = useState(null);
  
  const [loadingMails, setLoadingMails] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false); 
  
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [fullEmailBody, setFullEmailBody] = useState(""); 
  const [loadingBody, setLoadingBody] = useState(false);
  
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [isComposing, setIsComposing] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });
  // Baki states ke sath isko add karo
  const [taskFilter, setTaskFilter] = useState("all");

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOutUser();
  };

  const handleRefreshMails = async () => {
    setLoadingMails(true);
    try {
      const [inboxRes, sentRes] = await Promise.all([fetchInboxData(null), fetchSentData(null)]);
      setInboxEmails(inboxRes.emails || []);
      setInboxNextPage(inboxRes.nextPageToken || null);
      
      setSentEmails(sentRes.emails || []);
      setSentNextPage(sentRes.nextPageToken || null);
    } catch (error) { console.error("Refresh error", error); } 
    finally { setLoadingMails(false); }
  };

  const handleLoadMore = async () => {
      setLoadingMore(true);
      try {
          if (activeFolder === "inbox" && inboxNextPage) {
              const res = await fetchInboxData(inboxNextPage);
              setInboxEmails(prev => [...prev, ...(res.emails || [])]);
              setInboxNextPage(res.nextPageToken || null);
          } else if (activeFolder === "sent" && sentNextPage) {
              const res = await fetchSentData(sentNextPage);
              setSentEmails(prev => [...prev, ...(res.emails || [])]);
              setSentNextPage(res.nextPageToken || null);
          }
      } catch (error) { console.error("Load more failed", error); }
      finally { setLoadingMore(false); }
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
            // 🔥 NAYA: Added actionItem and senderName
            newTasksObj[taskId] = { 
              id: taskId, 
              originalMessageId: task.id, 
              title: task.title || "No Title", 
              actionItem: task.actionItem || "Review email for further details.",
              deadline: task.deadline || "No Deadline", 
              priority: task.priority || "Low", 
              senderName: task.senderName || task.source || task.sourceEmail || "Unknown Sender",
              createdAt: task.createdAt || Date.now() // 🔥 NAYA: Timestamp add kiya
            };
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
      
      const newTasksObj = {};
      const newTaskIds = [];
      // 🔥 DEBUG LOG: Console mein dekho kya aaya!
      console.log("🚀 Fetched Tasks from Backend:", fetchedTasks);
      
      fetchedTasks.forEach((t, i) => {
        const id = `task-${Date.now()}-${i}`;
        // 🔥 NAYA: Added actionItem and senderName
        newTasksObj[id] = { 
          id, 
          title: t.title || "No Title", 
          actionItem: t.actionItem || "Check email for task details.",
          deadline: t.deadline || "No Deadline", 
          priority: t.priority || "Low", 
          senderName: t.senderName || t.sourceEmail || "Unknown Sender",
          createdAt: t.createdAt || Date.now() // 🔥 NAYA: Timestamp add kiya
        };
        newTaskIds.push(id);
      });

      const newState = { 
        ...initialData, 
        tasks: newTasksObj, 
        columns: { ...initialData.columns, todo: { ...initialData.columns.todo, taskIds: newTaskIds } } 
      };
      
      setBoardData(newState);
      localStorage.setItem("mailwareBoardData", JSON.stringify(newState));
      alert("Board Updated!");
    } catch (e) { alert("Sync failed"); }
    setIsSyncing(false);
  };
  
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    const startCol = boardData.columns[source.droppableId];
    const finishCol = boardData.columns[destination.droppableId];

    // 🔥 FIX: Find actual index if list is currently filtered
    let actualSourceIndex = source.index;
    if (source.droppableId === "todo" && taskFilter !== "all") {
      actualSourceIndex = startCol.taskIds.indexOf(draggableId);
    }

    let newBoardState;
    if (startCol === finishCol) {
      // Agar list filtered hai toh same column mein re-order allow mat karo
      if (taskFilter !== "all") {
          alert("Please set the filter to 'All' to reorder tasks in To Do.");
          return;
      }
      const newTaskIds = Array.from(startCol.taskIds);
      newTaskIds.splice(actualSourceIndex, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      const newCol = { ...startCol, taskIds: newTaskIds };
      newBoardState = { ...boardData, columns: { ...boardData.columns, [newCol.id]: newCol } };
    } else {
      const startTaskIds = Array.from(startCol.taskIds);
      startTaskIds.splice(actualSourceIndex, 1);
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

  const handleTaskClick = (task) => {
    setSelectedEmail({
        id: task.originalMessageId || task.id, 
        subject: `Task Source: ${task.title}`,
        from: task.senderName || task.source,
        date: task.deadline || "Linked to task",
        snippet: "Opening email linked with this task...",
        isUnread: false
    });
    setIsComposing(false);
  };

  const handleDeleteTask = (taskId, e) => {
      e.stopPropagation(); 
      
      const newTasks = { ...boardData.tasks };
      delete newTasks[taskId];

      const newColumns = { ...boardData.columns };
      for (const colId in newColumns) {
          newColumns[colId] = {
              ...newColumns[colId],
              taskIds: newColumns[colId].taskIds.filter(id => id !== taskId)
          };
      }

      const newBoardState = { ...boardData, tasks: newTasks, columns: newColumns };
      setBoardData(newBoardState);
      localStorage.setItem("mailwareBoardData", JSON.stringify(newBoardState));
      
      const savedTasks = JSON.parse(localStorage.getItem("aiTasks") || "[]");
      const updatedTasks = savedTasks.filter(t => (t.id || t.originalMessageId) !== taskId);
      localStorage.setItem("aiTasks", JSON.stringify(updatedTasks));
  };

  const getPriorityColor = (p) => p?.toLowerCase() === 'high' ? '#fce8e8' : p?.toLowerCase() === 'medium' ? '#fef3c7' : '#e6f4ea';
  const getPriorityTextColor = (p) => p?.toLowerCase() === 'high' ? '#c5221f' : p?.toLowerCase() === 'medium' ? '#b08800' : '#137333';

  const currentListToDisplay = activeFolder === "inbox" ? inboxEmails : sentEmails;
  const currentNextPageToken = activeFolder === "inbox" ? inboxNextPage : sentNextPage;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f8f9fa", fontFamily: "'Google Sans', sans-serif" }}>
      
      {/* TOP NAV */}
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
        
        {/* LEFT PANE */}
        <div style={{ width: "380px", minWidth: "380px", maxWidth: "380px", flexShrink: 0, background: "#fff", borderRight: "1px solid #e8eaed", display: "flex", flexDirection: "column", zIndex: 5 }}>
            <div style={{ padding: "16px", borderBottom: "1px solid #e8eaed", background: "#fff" }}>
                 <button onClick={() => { setIsComposing(true); setSelectedEmail(null); }} style={{ width: "100%", padding: "12px", background: "#c2e7ff", color: "#001d35", border: "none", borderRadius: "16px", fontWeight: "600", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", transition: "background 0.2s" }}>
                    <span>✏️</span> Compose New Mail
                 </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px", borderBottom: "1px solid #e8eaed", background: "#fbfbfb" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => { setActiveFolder("inbox"); setSelectedEmail(null); }} style={{ padding: "6px 12px", border: "none", background: activeFolder === "inbox" ? "#e8eaed" : "transparent", borderRadius: "16px", fontWeight: "600", color: activeFolder === "inbox" ? "#202124" : "#5f6368", cursor: "pointer", fontSize: "13px" }}>📥 Inbox</button>
                    <button onClick={() => { setActiveFolder("sent"); setSelectedEmail(null); }} style={{ padding: "6px 12px", border: "none", background: activeFolder === "sent" ? "#e8eaed" : "transparent", borderRadius: "16px", fontWeight: "600", color: activeFolder === "sent" ? "#202124" : "#5f6368", cursor: "pointer", fontSize: "13px" }}>📤 Sent</button>
                </div>
                <button onClick={handleRefreshMails} disabled={loadingMails} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "16px", padding: "4px" }} title="Refresh Mails">{loadingMails ? "⏳" : "🔄"}</button>
            </div>
            
            <div style={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden" }}>
                {loadingMails ? (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: "#5f6368", fontSize: "14px" }}>Loading {activeFolder}... ⏳</div>
                ) : currentListToDisplay.length === 0 ? (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: "#5f6368", fontSize: "14px" }}>No emails here.</div>
                ) : (
                    <>
                        {currentListToDisplay.map((email, i) => (
                            <div key={i} onClick={() => setSelectedEmail(email)} style={{ padding: "16px 20px", borderBottom: "1px solid #f1f3f4", cursor: "pointer", background: selectedEmail?.id === email.id ? "#e8f0fe" : (email.isUnread ? "#fff" : "#fafafa"), borderLeft: selectedEmail?.id === email.id ? "4px solid #1a73e8" : "4px solid transparent", transition: "background 0.2s", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: email.isUnread ? "#1a73e8" : "transparent", marginTop: "6px", flexShrink: 0 }}></div>
                                <div style={{ flexGrow: 1, overflow: "hidden" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                        <span style={{ fontWeight: email.isUnread ? "700" : "500", color: email.isUnread ? "#202124" : "#5f6368", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>{activeFolder === "inbox" ? email.from : `To: ${email.to}`}</span>
                                        <span style={{ fontSize: "11px", color: email.isUnread ? "#1a73e8" : "#80868b", fontWeight: email.isUnread ? "700" : "500", flexShrink: 0 }}>{email.date.split(' ')[1]} {email.date.split(' ')[2]}</span>
                                    </div>
                                    <div style={{ fontWeight: email.isUnread ? "700" : "500", color: email.isUnread ? "#202124" : "#5f6368", fontSize: "13px", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email.subject}</div>
                                    <div style={{ color: "#616161", fontSize: "12.5px", lineHeight: "1.5", marginTop: "6px", wordWrap: "break-word" }}>{email.snippet}</div>
                                </div>
                            </div>
                        ))}
                        {currentNextPageToken && (
                            <div style={{ padding: "16px", textAlign: "center" }}>
                                <button onClick={handleLoadMore} disabled={loadingMore} style={{ padding: "8px 24px", background: "#f1f3f4", color: "#1a73e8", border: "1px solid #dadce0", borderRadius: "20px", cursor: loadingMore ? "wait" : "pointer", fontWeight: "600", fontSize: "13px", transition: "all 0.2s" }}>{loadingMore ? "Loading..." : "Load More Emails 👇"}</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>

        {/* RIGHT PANE: DYNAMIC */}
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
                    
                    <h1 style={{ fontSize: "18px", color: "#202124", marginBottom: "8px" }}>{selectedEmail.subject}</h1>
                    <div style={{ color: "#5f6368", fontSize: "14px", marginBottom: "14px" }}>
                        {activeFolder === "inbox" ? ( <>From: <strong style={{color: "#202124"}}>{selectedEmail.from}</strong></> ) : ( <>To: <strong style={{color: "#202124"}}>{selectedEmail.to}</strong></> )} • {selectedEmail.date}
                    </div>

                    <div style={{ flexGrow: 1, background: "#fafafa", padding: "24px", borderRadius: "12px", border: "1px solid #f1f3f4", overflowX: "auto", marginBottom: "24px" }}>
                        {loadingBody ? <div style={{ color: "#5f6368", textAlign: "center", marginTop: "20px" }}>Fetching email contents... ⏳</div> : <div style={{ color: "#202124", fontSize: "14px", lineHeight: "1.6" }} dangerouslySetInnerHTML={{ __html: fullEmailBody }} />}
                    </div>
{/* Compact Reply Box Container */}
<div style={{ background: "#fff", border: "1px solid #dadce0", borderRadius: "12px", padding: "12px 16px", boxShadow: "0 -2px 10px rgba(0,0,0,0.05)", marginTop: "auto" }}>
    <textarea 
        value={replyText} 
        onChange={(e) => setReplyText(e.target.value)} 
        placeholder="Type your reply here..." 
        style={{ 
            width: "100%", 
            minHeight: "10px", /* 🔥 NAYA: Height kam kar di */
            maxHeight: "0px", 
            border: "none", 
            outline: "none", 
            resize: "vertical", /* 🔥 NAYA: User zaroorat padne par isko bada kar sakta hai */
            fontSize: "14px", 
            color: "#202124", 
            fontFamily: "inherit" 
        }} 
    />
    
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #f1f3f4" }}>
        <span style={{ fontSize: "12px", color: "#80868b" }}>Powered by Mailware APIs</span>
        <button onClick={handleSendReply} disabled={isSendingReply || !replyText.trim()} style={{ padding: "8px 20px", background: (isSendingReply || !replyText.trim()) ? "#e8eaed" : "#1a73e8", color: (isSendingReply || !replyText.trim()) ? "#9aa0a6" : "#fff", border: "none", borderRadius: "20px", cursor: (isSendingReply || !replyText.trim()) ? "not-allowed" : "pointer", fontWeight: "600", fontSize: "13px", transition: "background 0.2s" }}>
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
                      
                      <div style={{ display: "flex", gap: "12px" }}>
                          <button onClick={() => { if(window.confirm("Clear all tasks?")) { localStorage.removeItem("mailwareBoardData"); localStorage.removeItem("aiTasks"); window.location.reload(); } }} style={{ padding: "10px 16px", background: "#fff", color: "#d93025", border: "1px solid #fce8e8", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px", transition: "background 0.2s" }}>🗑️ Clear Board</button>
                          <button onClick={doSync} disabled={isSyncing} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: isSyncing ? "#e8eaed" : "#1a73e8", color: isSyncing ? "#5f6368" : "#fff", fontWeight: "600", fontSize: "13px", border: "none", borderRadius: "8px", cursor: isSyncing ? "not-allowed" : "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.12)", transition: "background 0.2s" }}>{isSyncing ? "⏳ Syncing..." : "🔄 Sync Tasks"}</button>
                      </div>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                      <div style={{ display: "flex", gap: "24px", padding: "16px 32px 32px 32px", overflowX: "auto", flexGrow: 1, alignItems: "flex-start" }}>
                      {boardData.columnOrder.map((columnId) => {
  const column = boardData.columns[columnId];
  let tasks = column.taskIds.map((taskId) => boardData.tasks[taskId]);

  // 🔥 NAYA: Filtering Logic sirf 'To Do' column ke liye
  if (column.id === "todo" && taskFilter !== "all") {
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    
    tasks = tasks.filter(task => {
      if (!task.createdAt) return true; // Fallback purane tasks ke liye
      const diff = now - task.createdAt;
      
      if (taskFilter === "today") return diff <= ONE_DAY;
      if (taskFilter === "7days") return diff <= 7 * ONE_DAY;
      if (taskFilter === "14days") return diff <= 14 * ONE_DAY;
      return true;
    });
  }

  return (
    <div key={column.id} style={{ background: "#e4e8ec", borderRadius: "12px", width: "320px", flexShrink: 0, display: "flex", flexDirection: "column", maxHeight: "100%" }}>
      
      {/* 🔥 NAYA: Column Header with Dropdown Filter */}
      <div style={{ padding: "16px", fontWeight: "600", color: "#3c4043", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {column.title}
          <span style={{ background: "#d1d6dc", padding: "2px 8px", borderRadius: "12px", fontSize: "12px", color:"#3c4043" }}>{tasks.length}</span>
        </div>
        
        {/* Sirf To-Do list mein dropdown dikhega */}
        {column.id === "todo" && (
          <select 
            value={taskFilter} 
            onChange={(e) => setTaskFilter(e.target.value)}
            style={{ fontSize: "11px", padding: "4px", borderRadius: "6px", border: "1px solid #dadce0", background: "#fff", cursor: "pointer", outline: "none", color: "#5f6368" }}
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="14days">Last 14 Days</option>
          </select>
        )}
      </div>

      <Droppable droppableId={column.id}>
      
                                {(provided, snapshot) => (
                                  <div ref={provided.innerRef} {...provided.droppableProps} style={{ padding: "0 16px 16px 16px", flexGrow: 1, overflowY: "auto", minHeight: "150px", transition: "background 0.2s ease", borderRadius: "0 0 12px 12px", background: snapshot.isDraggingOver ? "#d3e3fd" : "transparent" }}>
                                    {tasks.map((task, index) => (
                                      <Draggable key={task.id} draggableId={task.id} index={index}>
                                        {(provided, snapshot) => (
                                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} 
                                          onClick={() => handleTaskClick(task)}
                                          style={{ userSelect: "none", padding: "16px", margin: "0 0 12px 0", backgroundColor: "#fff", color: "#202124", borderRadius: "8px", boxShadow: snapshot.isDragging ? "0 8px 16px rgba(0,0,0,0.15)" : "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #dadce0", cursor: "pointer", position: "relative", ...provided.draggableProps.style }}>
                                            
                                            {/* 🔥 NAYA: Cross (Delete) Button on Task */}
                                            <div 
                                                onClick={(e) => handleDeleteTask(task.id, e)} 
                                                style={{ position: "absolute", top: "12px", right: "12px", background: "#f1f3f4", color: "#5f6368", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", cursor: "pointer", transition: "background 0.2s" }}
                                                title="Remove Task"
                                            >
                                                ✖
                                            </div>

                                            {/* Priority Badge */}
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                                <span style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", padding: "4px 8px", borderRadius: "4px", background: getPriorityColor(task.priority), color: getPriorityTextColor(task.priority) }}>
                                                    {task.priority || "Low"}
                                                </span>
                                            </div>

                                            {/* Sender Name */}
                                            <div style={{ fontSize: "11px", color: "#5f6368", marginBottom: "6px", fontWeight: "500" }}>
                                                From: <span style={{ color: "#202124", fontWeight: "600" }}>{task.senderName}</span>
                                            </div>

                                            {/* Task Title */}
                                            <div style={{ fontSize: "14px", fontWeight: "700", lineHeight: "1.3", marginBottom: "6px", paddingRight: "20px", color: "#202124" }}>
                                                {task.title}
                                            </div>

                                           {/* Action Item (What to do) */}
<div style={{ fontSize: "12px", color: "#5f6368", marginBottom: "14px", lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
    {task.actionItem}
</div>

{/* 🔥 NAYA: Added Date Indicator */}
<div style={{ fontSize: "10px", color: "#a1a5ab", marginBottom: "8px", fontWeight: "500" }}>
    Added on: {new Date(task.createdAt || Date.now()).toLocaleDateString()}
</div>

                                            {/* Deadline & Open Link */}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f3f4", paddingTop: "10px" }}>
                                                <div style={{ fontSize: "11px", fontWeight: "600", color: task.deadline !== "No Deadline" ? "#d93025" : "#80868b", display: "flex", alignItems: "center", gap: "4px" }}>
                                                    🕒 {task.deadline}
                                                </div>
                                                <div style={{ fontSize: "11px", color: "#1a73e8", fontWeight: "600" }}>
                                                    Open Email ↗
                                                </div>
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