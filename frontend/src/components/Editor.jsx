import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardMedia,
  Typography,
  IconButton,
  CardContent,
  CardActionArea,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FileList from "./FileList";
import EditorTabs from "./EditorTabs";
import TextEditor from "./TextEditor";
import Tools from "./Tools";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Cookies from "js-cookie";
import useAPI from "../hooks/api";

function Editor() {
  const { projectId } = useParams();
  const [open, setOpen] = React.useState(false);
  const [socket, setSocket] = useState(null);

  const { GET } = useAPI();

  useEffect(() => {
    const s = io("http://localhost:8000");
    setSocket((prev) => s);

    return () => {
      s.disconnect();
    };
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // const [allFiles, setAllFiles] = useState([]); // To store opened tabs
  const [allFiles, setAllFiles] = useState([]);
  const [openedTabs, setOpenedTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0); // To track the currently selected tab
  const [selectedFileId, setSelectedFileId] = useState(null); // To highlight selected file

  // Function to handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab((prev) => newValue);
    setSelectedFileId((prev) => openedTabs[newValue].id); // Update selected file ID when tab changes
  };

  // Function to open a new tab when file is clicked
  const handleFileClick = (file) => {
    const openedIndex = openedTabs.findIndex(
      (tab) => tab.file_name === file.file_name
    );

    if (openedIndex === -1) {
      // Open a new tab if not already opened
      setOpenedTabs((prev) => [...openedTabs, file]);
      setSelectedTab((prev) => openedTabs.length); // Select the new tab
      setSelectedFileId((prev) => file.file_id); // Update selected file ID
    } else {
      // Switch to the already opened tab
      setSelectedTab((prev) => openedIndex);
      setSelectedFileId((prev) => file.file_id); // Update selected file ID
    }
  };

  // Function to close a tab
  const handleCloseTab = (tabIndex) => {
    const updatedTabs = openedTabs.filter((_, index) => index !== tabIndex);
    setOpenedTabs(updatedTabs);

    // Adjust selectedTab index after closing
    if (tabIndex === selectedTab) {
      if (updatedTabs.length > 0) {
        // Select the previous tab if closing the currently selected tab
        setSelectedTab((prev) => (tabIndex > 0 ? tabIndex - 1 : 0));
        setSelectedFileId(
          (prev) =>
            updatedTabs[tabIndex > 0 ? tabIndex - 1 : 0]?.file_id || null
        );
      } else {
        setSelectedTab((prev) => null);
        setSelectedFileId((prev) => null);
      }
    } else if (tabIndex < selectedTab) {
      setSelectedTab((prev) => selectedTab - 1);
      setSelectedFileId((prev) => prev);
    }
  };

  const getAllFiles = async () => {
    try {
      const results = await GET("/project/get-all-files", { projectId });
      // const data = transformData(results.data);
      console.log("data", results.data);
      const { data } = results;
      const specificUsername = Cookies.get("username");

      const openFiles = data.filter(
        (file) =>
          file.users.length > 0 &&
          file.users.some((user) => user.username === specificUsername)
      );
      setOpenedTabs((prev) => openFiles);

      const activeTabIndex = openFiles.findIndex((tab) =>
        tab.users.some(
          (user) => user.username === specificUsername && user.is_active_in_tab
        )
      );

      setSelectedTab((prev) => (activeTabIndex >= 0 ? activeTabIndex : 0)); // Set the selected tab index

      // Find the file ID of the active tab for the specific user
      const activeTab = openFiles.find((tab) =>
        tab.users.some(
          (user) => user.username === specificUsername && user.is_active_in_tab
        )
      );

      // Set the file_id of the active tab, or null if not found
      setSelectedFileId((prev) => activeTab?.file_id || null);
      setAllFiles((prev) => data);
    } catch (err) {
      console.log("err ->", err);
    }
  };

  useEffect(() => {
    getAllFiles();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.emit("joinFile", {
        file_id: selectedFileId,
        username: Cookies.get("username"),
      });
    }
  }, [selectedFileId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("userLeft-live", ({ username }) => {
      console.log("userLeft", username);
      setAllFiles((prev) =>
        prev.map((file) => ({
          ...file,
          users: file.users.map((user) => {
            if (user.username === username) {
              return { ...user, is_live: false };
            }
            return user;
          }),
        }))
      );
    });

    socket.on("userLeft", ({ file_id: fileID, username }) => {
      console.log("userLeft", fileID, username);
      setAllFiles((prev) =>
        prev.map((file) =>
          file.file_id === fileID
            ? {
              ...file,
              users: file.users.filter((user) => user.username !== username),
            }
            : file
        )
      );
    });

    socket.on("userJoined", ({ person }) => {
      if (!person?.length) {
        return;
      }

      console.log("userJoined", person);

      setAllFiles((prev) =>
        prev
          .map((file) => ({
            ...file,
            users: file.users.map((user) => {
              if (user.username === person[0].username) {
                return { ...user, is_active_in_tab: false };
              }
              return user;
            }),
          }))
          .map((file) => {
            // Check each person
            person.forEach((newPerson) => {
              if (file.file_id === newPerson.file_id) {
                const userExists = file.users.some(
                  (user) => user.username === newPerson.username
                );

                if (userExists) {
                  file = {
                    ...file,
                    users: file.users.map((user) => {
                      if (user.username === newPerson.username) {
                        return {
                          ...user,
                          is_active_in_tab: newPerson.is_active_in_tab,
                          is_live: newPerson.is_live,
                          live_users_timestamp: newPerson.live_users_timestamp,
                        };
                      }
                      return user;
                    }),
                  };
                } else {
                  file = {
                    ...file,
                    users: [
                      ...file.users,
                      {
                        is_active_in_tab: newPerson.is_active_in_tab,
                        is_live: newPerson.is_live,
                        live_users_timestamp: newPerson.live_users_timestamp,
                        username: newPerson.username,
                      },
                    ],
                  };
                }
              }
            });
            return file;
          })
      );
    });

    return () => {
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("userLeft-live");
    };
  }, [socket, selectedFileId, allFiles, openedTabs]);

  useEffect(() => {
    console.log("allFiles", allFiles);
  }, [allFiles]);

  return (
    <>
      <Tools selectedFileId={selectedFileId} files={allFiles} />
      <div style={{ display: "flex", height: "100vh" }}>
        {/* File List */}
        <FileList
          getAllFiles={getAllFiles}
          allFiles={allFiles}
          onFileClick={handleFileClick}
          selectedFileId={selectedFileId}
        />
        {/* Open Tabs and File Content */}
        {openedTabs.length === 0 ? (
          <>
            <Box
              sx={{
                width: "100%",
                maxWidth: "1200px",
                mx: "auto",
                px: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  py: 2,
                }}
              >
                <Typography variant="h6" sx={{ color: "text.secondary" }}>
                  Start a new file
                </Typography>

                <IconButton color="default">
                  <MoreVertIcon />
                </IconButton>
              </Box>
              <Card
                sx={{
                  width: 160,
                  height: 200,
                  border: "1px solid #999999", // Initial border to handle the hover effect properly
                  transition: "border 0.3s ease", // Smooth transition for the border effect
                  "&:hover": {
                    border: "1px solid black",
                  },
                }}
              >
                <CardActionArea onClick={handleClickOpen}>
                  <CardMedia
                    component="img"
                    alt="Blank Document"
                    height="140"
                    image="https://links.papareact.com/pju"
                  />
                  <CardContent>
                    <Typography variant="body1">Blank</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
          </>
        ) : (
          <EditorTabs
            socket={socket}
            allFiles={allFiles}
            selectedTab={selectedTab}
            handleTabChange={handleTabChange}
            handleCloseTab={handleCloseTab}
            selectedFileId={selectedFileId}
            setAllFiles={setAllFiles}
            openedTabs={openedTabs}
          />
        )}
      </div>
    </>
  );
}

export default Editor;
