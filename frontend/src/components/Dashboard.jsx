// src/components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { BrandMark } from "./BrandMark";
import { signOutUser, syncEmails } from "../firebase/config"; // syncEmails import kiya
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// ─── KANBAN BOARD KA EMPTY STRUCTURE ───
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
  const [isSyncing, setIsSyncing] = useState(false); // Sync Button Loading State
  const [boardData, setBoardData] = useState(initialData);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOutUser();
  };

  // ─── 🔄 SYNC BUTTON LOGIC ───
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // API call
      const fetchedTasks = await syncEmails(user.email);
      
      let newTasksAdded = 0;
      const updatedTasks = { ...boardData.tasks };
      const newTodoIds = [...boardData.columns.todo.taskIds];

      // Sirf NAYE tasks filter karke add karna
      fetchedTasks.forEach((task, index) => {
        const taskId = task.id || `ai-task-${Date.now()}-${index}`;
        
        // Agar ye task id pehle se board par nahi hai
        if (!updatedTasks[taskId]) {
          updatedTasks[taskId] = {
            id: taskId,
            title: task.title || "Untitled Task",
            deadline: task.deadline || "",
            priority: task.priority || "Medium",
            source: task.source || task.sourceEmail || "Unknown",
          };
          newTodoIds.unshift(taskId); // Naye task ko list ke sabse upar daalo
          newTasksAdded++;
        }
      });

      if (newTasksAdded > 0) {
        const newBoardState = {
          ...boardData,
          tasks: updatedTasks,
          columns: {
            ...boardData.columns,
            todo: { ...boardData.columns.todo, taskIds: newTodoIds },
          },
        };
        setBoardData(newBoardState);
        localStorage.setItem("mailwareBoardData", JSON.stringify(newBoardState));
        alert(`✅ ${newTasksAdded} Naye tasks Inbox se load ho gaye!`);
      } else {
        alert("ℹ️ Inbox mein koi naya unread email/task nahi mila.");
      }

    } catch (error) {
      alert("Sync failed: " + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // ─── 📥 INITIAL LOAD LOGIC (JAB PAGE KHULEGA) ───
  useEffect(() => {
    const loadTasks = () => {
      // Pehle check karo agar board already saved hai (taaki drag/drop reset na ho)
      const savedBoard = localStorage.getItem("mailwareBoardData");
      if (savedBoard) {
        setBoardData(JSON.parse(savedBoard));
        return;
      }

      // Agar fresh login hai toh raw tasks load karo
      const savedTasks = localStorage.getItem("aiTasks");
      if (savedTasks) {
        try {
          const parsedTasks = JSON.parse(savedTasks);
          const newTasksObj = {};
          const newTaskIds = [];

          parsedTasks.forEach((task, index) => {
            const taskId = task.id || `ai-task-${index}`;
            newTasksObj[taskId] = {
              id: taskId,
              title: task.title || "Untitled Task",
              deadline: task.deadline || "",
              priority: task.priority || "Medium",
              source: task.source || task.sourceEmail || "Unknown",
            };
            newTaskIds.push(taskId); 
          });

          const freshBoardState = {
            ...initialData,
            tasks: newTasksObj,
            columns: {
              ...initialData.columns,
              todo: { ...initialData.columns.todo, taskIds: newTaskIds },
            },
          };
          
          setBoardData(freshBoardState);
          localStorage.setItem("mailwareBoardData", JSON.stringify(freshBoardState));
        } catch (error) {
          console.error("Tasks load error:", error);
        }
      }
    };

    loadTasks();
    window.addEventListener("tasksUpdated", loadTasks);
    return () => window.removeEventListener("tasksUpdated", loadTasks);
  }, []);

  // ─── ✋ DRAG AND DROP LOGIC ───
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

      newBoardState = {
        ...boardData,
        columns: { ...boardData.columns, [newStart.id]: newStart, [newFinish.id]: newFinish },
      };
    }

    setBoardData(newBoardState);
    localStorage.setItem("mailwareBoardData", JSON.stringify(newBoardState)); // State Memory Save
  };

  const getPriorityColor = (priority) => {
    if (priority?.toLowerCase() === 'high') return '#fce8e8';
    if (priority?.toLowerCase() === 'medium') return '#fef3c7';
    return '#e6f4ea';
  };

  const getPriorityTextColor = (priority) => {
    if (priority?.toLowerCase() === 'high') return '#c5221f';
    if (priority?.toLowerCase() === 'medium') return '#b08800';
    return '#137333';
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Google Sans', sans-serif" }}>
      
      {/* ─── TOP NAVIGATION BAR ─── */}
      <div style={{ 
        display: "flex", justifyContent: "space-between", alignItems: "center", 
        padding: "16px 32px", background: "#fff", borderBottom: "1px solid #e8eaed",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <BrandMark size={32} color="#1a73e8" radius={8} />
          <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#202124", margin: 0 }}>Mailware</h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {user?.photoURL && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "14px", color: "#5f6368" }}>{user.email}</span>
              <img src={user.photoURL} alt="User" style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #e8eaed" }} />
            </div>
          )}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              padding: "8px 20px", fontSize: 13, fontWeight: 500, color: "#5f6368",
              background: "transparent", border: "1px solid #dadce0", borderRadius: 20,
              cursor: signingOut ? "not-allowed" : "pointer",
            }}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>

      {/* ─── KANBAN BOARD AREA ─── */}
      <div style={{ padding: "32px", overflowX: "auto" }}>
        
        {/* Board Header with Title & Sync Button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#202124", margin: "0 0 8px 0" }}>Your AI Task Board</h2>
            <div style={{ display: "inline-block", background: "#e8f0fe", color: "#1557b0", padding: "6px 12px", borderRadius: "16px", fontSize: "12px", fontWeight: "500" }}>
              ✦ AI is managing your inbox
            </div>
          </div>

          <button 
             onClick={handleSync} 
             disabled={isSyncing}
             style={{ 
                 display: "flex", alignItems: "center", gap: "8px",
                 padding: "10px 20px", background: isSyncing ? "#e8eaed" : "#1a73e8", 
                 color: isSyncing ? "#5f6368" : "#fff", fontWeight: "600", fontSize: "13px",
                 border: "none", borderRadius: "8px", cursor: isSyncing ? "not-allowed" : "pointer",
                 transition: "background 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
             }}>
             {isSyncing ? "⏳ Analyzing Mails..." : "🔄 Sync New Emails"}
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: "flex", gap: "24px" }}>
            {boardData.columnOrder.map((columnId) => {
              const column = boardData.columns[columnId];
              const tasks = column.taskIds.map((taskId) => boardData.tasks[taskId]);

              return (
                <div key={column.id} style={{
                  background: "#f1f3f4", borderRadius: "12px", width: "320px", flexShrink: 0,
                  display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 180px)"
                }}>
                  <div style={{ padding: "16px", fontWeight: "600", color: "#3c4043", borderBottom: "1px solid #e8eaed", display: "flex", justifyContent: "space-between" }}>
                    {column.title}
                    <span style={{ background: "#e8eaed", padding: "2px 8px", borderRadius: "12px", fontSize: "12px" }}>{tasks.length}</span>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          padding: "16px", flexGrow: 1, overflowY: "auto", minHeight: "150px",
                          background: snapshot.isDraggingOver ? "#e8f0fe" : "transparent",
                          transition: "background 0.2s ease"
                        }}
                      >
                        {tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  userSelect: "none", padding: "16px", margin: "0 0 12px 0", minHeight: "50px",
                                  backgroundColor: "#fff", color: "#202124", borderRadius: "8px",
                                  boxShadow: snapshot.isDragging ? "0 8px 16px rgba(0,0,0,0.1)" : "0 1px 2px rgba(0,0,0,0.05)",
                                  border: "1px solid #dadce0",
                                  ...provided.draggableProps.style,
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                  <span style={{
                                    fontSize: "10px", fontWeight: "bold", textTransform: "uppercase",
                                    padding: "4px 8px", borderRadius: "4px",
                                    background: getPriorityColor(task.priority),
                                    color: getPriorityTextColor(task.priority)
                                  }}>
                                    {task.priority || "Low"}
                                  </span>
                                </div>
                                <div style={{ fontSize: "14px", fontWeight: "500", lineHeight: "1.4", marginBottom: "12px" }}>
                                  {task.title}
                                </div>
                                <div style={{ fontSize: "11px", color: "#5f6368", display: "flex", flexDirection: "column", gap: "4px" }}>
                                  {task.deadline && <div>🕒 {task.deadline}</div>}
                                  {task.source && <div>👤 {task.source}</div>}
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
      </div>
    </div>
  );
}