// Editor.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Box, Typography } from "@mui/material";
import FileExplorer from "../components/FileExplorer";
import Tabs from "../components/Tabs";
import { useParams } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import Tools from "../components/Tools";
import { useSocket } from "../context/socket";
import useAPI from "../hooks/api";
import Cookies from "js-cookie";
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DataArrayRoundedIcon from '@mui/icons-material/DataArrayRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';

const styles = {
  container: {
    display: "flex",
    height: "100%",
  },
  sidebar: {
    minWidth: "200px",
    backgroundColor: "#f0f0f0",
    color: "white",
    overflowY: "auto",
    transition: "width 0.2s ease",
  },
  dragHandle: {
    width: "5px",
    cursor: "ew-resize",
    backgroundColor: "#666",
    zIndex: 10,
  },
  mainContent: {
    flexGrow: 1,
    backgroundColor: "#f0f0f0",
  },
};


function Editor() {
  const navigate = useNavigate();
  const [tabs, setTabs] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [explorerData, setExplorerData] = useState({});
  const [initialTabs, setInitialTabs] = useState([]);
  const [liveUsers, setLiveUsers] = useState([]);

  const { GET } = useAPI();
  const params = useParams();
  const projectId = params?.projectId || null;

  const { socket } = useSocket();

  const getLiveUsers = async () => {
    try {
      const results = await GET("/project/get-live-users", { projectId });
      console.log("getLiveUsers", results.data);
      setLiveUsers((prev) => results.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getLiveUsers();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const liveUserJoined = ({ username }) => {
      setLiveUsers((prev) => {
        // Check if the username already exists
        const usernameExists = prev.some((user) => user.username === username);

        // If username already exists, return the previous state
        if (usernameExists) return prev;

        // Return a new array with the new user added
        return [...prev, { username }];
      });
    };

    const liveUserLeft = ({ username }) => {
      setLiveUsers((prev) => {
        // Return a new array with the specified username removed
        return prev.filter((user) => user.username !== username);
      });
    };

    socket.on("editor:live-user-joined", liveUserJoined);
    socket.on("editor:live-user-left", liveUserLeft);

    return () => {
      socket.off("editor:live-user-joined", liveUserJoined);
      socket.off("editor:live-user-left", liveUserLeft);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("editor:join-project", {
      project_id: projectId,
      username: window.localStorage.getItem("username"),
    });
  }, [socket]);

  const handleFileClick = (file) => {
    setTabs((prevTabs) => {
      const selectedIndex = prevTabs.findIndex(
        (tab) => tab.id === selectedFileId
      );
      const fileIndex = prevTabs.findIndex((tab) => tab.id === file.id);

      if (fileIndex === -1) {
        const newTabs = [...prevTabs];
        if (selectedIndex === -1) {
          newTabs.push(file);
        } else {
          newTabs.splice(selectedIndex + 1, 0, file);
        }
        return newTabs;
      }
      return prevTabs;
    });
    setSelectedFileId(file.id);
  };

  const handleCloseTab = (fileId) => {
    // socket.emit("code-editor:user-left", {
    //   file_id: fileId,
    //   username: window.localStorage.getItem("username"),
    // });
    setTabs((prevTabs) => {
      const updatedTabs = prevTabs.filter((tab) => tab.id !== fileId);
      if (selectedFileId === fileId) {
        const newSelectedFileId =
          updatedTabs.length > 0
            ? updatedTabs[updatedTabs.length - 1].id
            : null;
        setSelectedFileId(newSelectedFileId);
      }
      return updatedTabs;
    });
  };

  const getInitialTabs = async () => {
    try {
      const results = await GET("/project/get-initial-tabs", { projectId });
      console.log(results.data);

      const data = results.data.map((file) => ({
        id: file.file_id,
        name: file.file_name,
        users: [
          {
            is_active_in_tab: file.is_active_in_tab,
            is_live: file.is_live,
            live_users_timestamp: file.live_users_timestamp,
            project_id: file.project_id,
            username: file.username,
          },
        ],
      }));

      setTabs((prev) => data);
      setInitialTabs((prev) => results.data);

      setSelectedFileId((prev) => {
        const activeFile = results.data.find((file) => file.is_active_in_tab);
        return activeFile ? activeFile.file_id : null; // Return the file_id or null if not found
      });
    } catch (err) {
      console.log("err ->", err);
    }
  };

  useEffect(() => {
    getInitialTabs();
  }, []);

  useEffect(() => {
    console.log("tabs", tabs);
  }, [tabs]);

  useEffect(() => {
    if (!socket) return;
    initialTabs.forEach((file) => {
      socket.emit("code-editor:join-file", { file_id: file.file_id });
    });
  }, [initialTabs]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("code-editor:join-file", { file_id: selectedFileId });
  }, [selectedFileId]);

  const sidebarRef = useRef(null);
  const containerRef = useRef(null);
  const isDragging = useRef(false); // We use refs instead of state to avoid re-renders

  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = "ew-resize";
    document.getElementById("dragHandle").style.backgroundColor = "black";
    document.getElementById("dragHandle").style.border = "2px solid white";
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !sidebarRef.current || !containerRef.current) return;

    const newWidth = e.clientX;
    if (newWidth > 100 && newWidth < 600) { // Set min and max width for sidebar
      sidebarRef.current.style.width = `${newWidth}px`;
    }
  };

  const handleMouseUp = () => {
    if (isDragging.current) {
      isDragging.current = false;
      document.body.style.cursor = "default";
      document.getElementById("dragHandle").style.backgroundColor = "#666";
      document.getElementById("dragHandle").style.border = "none";
    }
  };

  // Adding event listeners when the component mounts
  React.useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Cleanup the event listeners when the component unmounts
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const [iconIndex, setIconIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIconIndex((prevIndex) => (prevIndex + 1) % 4); // Cycle through 0, 1, 2
    }, 1000); // Switch every 1 second

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const renderIcon = () => {
    switch (iconIndex) {
      case 0:
        return <DataObjectRoundedIcon sx={{ fontSize: "2em" }} />;
      case 1:
        return <i class="fa-solid fa-code" style={{ fontSize: "1.5em" }}></i>;
      case 2:
        return <DataArrayRoundedIcon sx={{ fontSize: "2em" }} />;
      case 3:
        return <FormatQuoteRoundedIcon sx={{ fontSize: "2em" }} />
      default:
        return null;
    }
  };

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <Tools liveUsers={liveUsers} />
      <div ref={containerRef} style={styles.container}>
        <div ref={sidebarRef} style={styles.sidebar}>
          <FileExplorer
            tabs={tabs}
            setTabs={setTabs}
            socket={socket}
            projectId={projectId}
            handleFileClick={handleFileClick}
            selectedFileId={selectedFileId}
            explorerData={explorerData}
            setExplorerData={setExplorerData}
          />
        </div>
        <div id="dragHandle" style={styles.dragHandle} onMouseDown={handleMouseDown} />
        <div style={styles.mainContent}>
          {tabs.length === 0 ? (
            <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
              <Typography variant="h2" sx={{ display: "flex", alignItems: "center" }}>
                {renderIcon()}
                <span style={{ marginLeft: "0.5em" }}>Workspace</span>
              </Typography>
            </Box>
          ) : (
            <>
              <Box>
                <Tabs
                  tabs={tabs}
                  setTabs={setTabs}
                  selectedFileId={selectedFileId}
                  handleFileClick={handleFileClick}
                  handleCloseTab={handleCloseTab}
                />
              </Box>
              <Box sx={{ position: "relative", width: "100%" }}>
                {tabs.length > 0 &&
                  tabs.map((tab) =>
                    tab && (
                      <Box
                        key={tab.id}
                        sx={{
                          width: "100%",
                          position: "relative",
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            backgroundColor: "black",
                            zIndex: tab.id === selectedFileId ? 100 : 0,
                          }}
                        >
                          <CodeEditor
                            fileName={tab.name}
                            socket={socket}
                            fileId={tab.id}
                            username={Cookies.get("username")}
                            setTabs={setTabs}
                          />
                        </Box>
                      </Box>
                    )
                  )}
              </Box>
            </>
          )}
        </div>
      </div>
    </div >
    // <Grid
    //   container
    //   direction="column"
    //   sx={{ height: "100", overflow: "hidden" }}
    // >
    //   <Tools liveUsers={liveUsers} />
    //   <Grid container item sx={{ flexGrow: 1, overflow: "hidden" }}>
    //     <Grid
    //       item
    //       xs={3}
    //       sx={{
    //         height: "100%",
    //         backgroundColor: "lavender",
    //         overflowY: "auto",
    //       }}
    //     >
    //       <Typography variant="h6" sx={{ paddingBottom: 1 }}>
    //         Explorer
    //       </Typography>
    //       <FileExplorer
    //         tabs={tabs}
    //         setTabs={setTabs}
    //         socket={socket}
    //         projectId={projectId}
    //         handleFileClick={handleFileClick}
    //         selectedFileId={selectedFileId}
    //         explorerData={explorerData}
    //         setExplorerData={setExplorerData}
    //       />
    //     </Grid>
    //     <Grid
    //       item
    //       xs={9}
    //       sx={{ height: "100%", padding: 0, width: "100%", overflow: "hidden" }}
    //     >
    //       <Grid>
    //         <Tabs
    //           tabs={tabs}
    //           setTabs={setTabs}
    //           selectedFileId={selectedFileId}
    //           handleFileClick={handleFileClick}
    //           handleCloseTab={handleCloseTab}
    //         />
    //       </Grid>

    //       <Grid sx={{ overflowY: "auto", width: "100%", height: "100%" }}>
    //         {tabs.length > 0 &&
    //           tabs.map(
    //             (tab) =>
    //               tab && (
    //                 <div
    //                   key={tab.id}
    //                   style={{
    //                     position: "relative",
    //                     width: "100%",
    //                   }}
    //                 >
    //                   <div
    //                     style={{
    //                       position: "abosulte",
    //                       zIndex: tab.id === selectedFileId ? 100 : 0,
    //                       width: "100%",
    //                       backgroundColor: "grey",
    //                     }}
    //                   >
    //                     <div>{tab.name}</div>
    //                     <CodeEditor
    //                       socket={socket}
    //                       fileId={tab.id}
    //                       username={window.localStorage.getItem("username")}
    //                       setTabs={setTabs}
    //                     />
    //                   </div>
    //                 </div>
    //               )
    //           )}
    //       </Grid>
    //     </Grid>
    //   </Grid>
    // </Grid>
  );
}

export default Editor;