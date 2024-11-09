import React, { useEffect, useRef, useState } from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";

import "codemirror/theme/3024-day.css";
import "codemirror/theme/3024-night.css";
import "codemirror/theme/abbott.css";
import "codemirror/theme/abcdef.css";
import "codemirror/theme/ambiance-mobile.css";
import "codemirror/theme/ambiance.css";
import "codemirror/theme/ayu-dark.css";
import "codemirror/theme/ayu-mirage.css";
import "codemirror/theme/base16-dark.css";
import "codemirror/theme/base16-light.css";
import "codemirror/theme/bespin.css";
import "codemirror/theme/blackboard.css";
import "codemirror/theme/cobalt.css";
import "codemirror/theme/colorforth.css";
import "codemirror/theme/darcula.css";
import "codemirror/theme/dracula.css";
import "codemirror/theme/duotone-dark.css";
import "codemirror/theme/duotone-light.css";
import "codemirror/theme/eclipse.css";
import "codemirror/theme/elegant.css";
import "codemirror/theme/erlang-dark.css";
import "codemirror/theme/gruvbox-dark.css";
import "codemirror/theme/hopscotch.css";
import "codemirror/theme/icecoder.css";
import "codemirror/theme/idea.css";
import "codemirror/theme/isotope.css";
import "codemirror/theme/juejin.css";
import "codemirror/theme/lesser-dark.css";
import "codemirror/theme/liquibyte.css";
import "codemirror/theme/lucario.css";
import "codemirror/theme/material-darker.css";
import "codemirror/theme/material-ocean.css";
import "codemirror/theme/material-palenight.css";
import "codemirror/theme/material.css";
import "codemirror/theme/mbo.css";
import "codemirror/theme/mdn-like.css";
import "codemirror/theme/midnight.css";
import "codemirror/theme/monokai.css";
import "codemirror/theme/moxer.css";
import "codemirror/theme/neat.css";
import "codemirror/theme/neo.css";
import "codemirror/theme/night.css";
import "codemirror/theme/nord.css";
import "codemirror/theme/oceanic-next.css";
import "codemirror/theme/panda-syntax.css";
import "codemirror/theme/paraiso-dark.css";
import "codemirror/theme/paraiso-light.css";
import "codemirror/theme/pastel-on-dark.css";
import "codemirror/theme/railscasts.css";
import "codemirror/theme/rubyblue.css";
import "codemirror/theme/seti.css";
import "codemirror/theme/shadowfox.css";
import "codemirror/theme/solarized.css";
import "codemirror/theme/ssms.css";
import "codemirror/theme/the-matrix.css";
import "codemirror/theme/tomorrow-night-bright.css";
import "codemirror/theme/tomorrow-night-eighties.css";
import "codemirror/theme/ttcn.css";
import "codemirror/theme/twilight.css";
import "codemirror/theme/vibrant-ink.css";
import "codemirror/theme/xq-dark.css";
import "codemirror/theme/xq-light.css";
import "codemirror/theme/yeti.css";
import "codemirror/theme/yonce.css";
import "codemirror/theme/zenburn.css";

import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/anyword-hint";

import "codemirror/keymap/emacs";
import "codemirror/keymap/sublime";
import "codemirror/keymap/vim";

import debounce from "lodash.debounce";

import { Box, Typography } from "@mui/material";
import { themes } from "../utils/code-editor-themes";
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';

const CodeEditor = ({ fileName, socket, fileId, username, setTabs }) => {
  const editorRef = useRef(null);
  const editorInstance = useRef(null);
  const isRemoteChange = useRef(false);
  const [users, setUsers] = useState({});
  const cursorElements = useRef({});

  const [selectedTheme, setSelectedTheme] = useState("monokai");

  useEffect(() => {
    socket.emit("code-editor:load-live-users", { file_id: fileId });
    return () => {
      socket.emit("code-editor:remove-cursor", { file_id: fileId, username });
      socket.emit("code-editor:leave-file", { file_id: fileId });
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const editor = CodeMirror.fromTextArea(editorRef.current, {
      mode: "javascript",
      theme: selectedTheme,
      keyMap: "sublime",
      lineNumbers: true,
      extraKeys: {
        "Ctrl-Space": "autocomplete",
      },
    });

    editorInstance.current = editor;

    const handleInputRead = debounce(function (cm, event) {
      if (!cm.state.completionActive && event.text[0].match(/\w/)) {
        cm.showHint({
          hint: CodeMirror.hint.anyword,
          completeSingle: false,
        });
      }
    }, 300);

    editor.on("inputRead", handleInputRead);

    editor.on("change", (instance, change) => {
      if (isRemoteChange.current || !change.origin) return;
      socket.emit("code-editor:send-change", { file_id: fileId, change });
    });

    const receiveChangeHandler = ({ file_id, change }) => {
      if (fileId === file_id) {
        isRemoteChange.current = true;
        editor.operation(() => {
          editor.replaceRange(
            change.text,
            change.from,
            change.to,
            change.origin
          );
        });
        isRemoteChange.current = false;
      }
    };

    socket.on("code-editor:receive-change", receiveChangeHandler);

    editor.on("cursorActivity", (instance) => {
      // debounce(() => {
      const cursor = editor.getCursor();
      socket.emit("code-editor:send-cursor", {
        file_id: fileId,
        username,
        position: cursor,
      });
      // }, 100)
    });

    const receiveCursorHandler = ({ file_id, username, position }) => {
      if (fileId === file_id) {
        setUsers((prevUsers) => ({
          ...prevUsers,
          [username]: position,
        }));
      }
    };
    socket.on("code-editor:receive-cursor", receiveCursorHandler);

    const removeCursorHandler = ({ file_id, username }) => {
      if (fileId === file_id) {
        setUsers((prevUsers) => {
          const newUsers = { ...prevUsers };
          delete newUsers[username];
          return newUsers;
        });
        // Remove cursor element for disconnected user
        if (cursorElements.current[username]) {
          cursorElements.current[username].remove();
          delete cursorElements.current[username];
        }
      }
    };
    socket.on("code-editor:remove-cursor", removeCursorHandler);

    const removeUserSpecificCursor = ({ username }) => {
      setUsers((prevUsers) => {
        const newUsers = { ...prevUsers };
        delete newUsers[username];
        return newUsers;
      });
      // Remove cursor element for disconnected user
      if (cursorElements.current[username]) {
        cursorElements.current[username].remove();
        delete cursorElements.current[username];
      }
    };

    socket.on(
      "code-editor:remove-user-specific-cursor",
      removeUserSpecificCursor
    );

    return () => {
      editor.toTextArea();
      socket.off("code-editor:receive-change", receiveChangeHandler);
      socket.off("code-editor:receive-cursor", receiveCursorHandler);
      socket.off("code-editor:remove-cursor", removeCursorHandler);
      socket.off(
        "code-editor:remove-user-specific-cursor",
        removeUserSpecificCursor
      );
      // Clean up all cursor elements
      Object.values(cursorElements.current).forEach((el) => el.remove());
      cursorElements.current = {};
    };
  }, [socket, username]);

  useEffect(() => {
    const userJoined = (data) => {
      if (!data && !data?.aUser) return;
      const { aUser } = data;
      console.log("userJoined", aUser);

      const {
        file_id,
        username,
        is_active_in_tab,
        is_live,
        live_users_timestamp,
        project_id,
      } = aUser;

      setTabs((prevTabs) => {
        // First, set is_active_in_tab = false for all tabs for the specified username
        const updatedTabs = prevTabs.map((tab) => {
          return {
            ...tab,
            users: tab.users.map((u) =>
              u.username === username ? { ...u, is_active_in_tab: false } : u
            ),
          };
        });

        // Now, update or add the user in the correct tab based on file_id
        return updatedTabs.map((tab) => {
          if (tab.id === file_id) {
            // Check if the user already exists in the tab
            const userExists = tab.users.some((u) => u.username === username);

            if (userExists) {
              // Update the existing user
              return {
                ...tab,
                users: tab.users.map((u) =>
                  u.username === username
                    ? {
                      ...u,
                      is_active_in_tab,
                      is_live,
                      live_users_timestamp,
                    }
                    : u
                ),
              };
            } else {
              // Add new user
              return {
                ...tab,
                users: [
                  ...tab.users,
                  {
                    username,
                    is_active_in_tab,
                    is_live,
                    live_users_timestamp,
                  },
                ],
              };
            }
          }
          return tab;
        });
      });
    };

    const userLeft = ({ file_id, username }) => {
      console.log("userLeft", fileId, username);
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === file_id
            ? {
              ...tab,
              users: tab.users.filter((user) => user.username !== username),
            }
            : tab
        )
      );
    };

    const removeActiveLiveUser = ({ username }) => {
      console.log("removeActiveLiveUser", username);
      setTabs((prevTabs) =>
        prevTabs.map((tab) => ({
          ...tab,
          users: tab.users.filter((user) => user.username !== username),
        }))
      );
    };

    const loadLiveUsers = ({ allUsers }) => {
      console.log("loadLiveUsers", allUsers);
      setTabs((prevTabs) => {
        // Update or add the users in the correct tab based on their file_id
        const updatedTabs = [...prevTabs];

        allUsers.forEach((aUser) => {
          const {
            file_id,
            username,
            is_active_in_tab,
            is_live,
            live_users_timestamp,
          } = aUser;

          updatedTabs.forEach((tab) => {
            if (tab.id === file_id) {
              // Check if the user already exists in the tab
              const userExists = tab.users.some((u) => u.username === username);

              if (userExists) {
                // Update the existing user
                tab.users = tab.users.map((u) =>
                  u.username === username
                    ? {
                      ...u,
                      is_active_in_tab,
                      is_live,
                      live_users_timestamp,
                    }
                    : u
                );
              } else {
                // Add new user
                tab.users.push({
                  username,
                  is_active_in_tab,
                  is_live,
                  live_users_timestamp,
                });
              }
            }
          });
        });

        return updatedTabs;
      });
    };

    socket.on("code-editor:user-joined", userJoined);
    socket.on("code-editor:user-left", userLeft);
    socket.on("code-editor:remove-active-live-user", removeActiveLiveUser);
    socket.on("code-editor:load-live-users", loadLiveUsers);

    return () => {
      socket.off("code-editor:user-joined", userJoined);
      socket.off("code-editor:user-left", userLeft);
      socket.off("code-editor:remove-active-live-user", removeActiveLiveUser);
      socket.off("code-editor:load-live-users", loadLiveUsers);
    };
  }, [socket, username]);

  useEffect(() => {
    const editor = editorInstance.current;
    if (!editor) return;

    Object.entries(users).forEach(([user, position]) => {
      // if (user === username) return; // Don't show own cursor

      let cursorElement = cursorElements.current[user];

      if (!cursorElement) {
        // Create new cursor element if it doesn't exist
        cursorElement = document.createElement("div");
        cursorElement.className = "remote-cursor";
        cursorElement.style.position = "absolute";
        cursorElement.style.width = "2px";
        cursorElement.style.height = "20px";
        cursorElement.style.backgroundColor = getRandomColor(user);

        const labelElement = document.createElement("div");
        labelElement.className = "remote-cursor-label";
        labelElement.textContent = user === username ? "You" : user;
        labelElement.style.position = "absolute";
        labelElement.style.left = "0";
        labelElement.style.top = "-20px";
        labelElement.style.backgroundColor = getRandomColor(user);
        labelElement.style.color = "white";
        labelElement.style.padding = "2px 4px";
        labelElement.style.borderRadius = "3px";
        labelElement.style.fontSize = "12px";

        cursorElement.appendChild(labelElement);
        editor.getWrapperElement().appendChild(cursorElement);
        cursorElements.current[user] = cursorElement;
      }

      // Update cursor position
      const cursorCoords = editor.cursorCoords(position, "local");
      cursorElement.style.left = `${cursorCoords.left + 29}px`;
      cursorElement.style.top = `${cursorCoords.top}px`;
    });
  }, [users, username]);

  const getRandomColor = (username) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 50%)`;
    return color;
  };

  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef(null);

  const toggleDropdown = (e) => setIsOpen((prev) => !prev);
  const handleClose = () => setIsOpen((prev) => false);

  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
    handleClose();
  }

  useEffect(() => {
    const editor = editorInstance.current;
    if (editor) { editor.setOption("theme", selectedTheme); }
  }, [selectedTheme]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on cleanup
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Function to handle keydown event
    const handleEsc = (event) => {
      if (event.key === "Escape") handleClose();
    };

    // Add event listener for keydown
    document.addEventListener("keydown", handleEsc);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: "2px" }}>
        <Box>
          <Typography sx={{ color: "white" }}>{fileName}</Typography>
        </Box>
        <Box sx={{ position: "relative" }}>
          <div
            onClick={toggleDropdown}
            style={{
              display: "flex",
              justifyContent: "space-between",
              minWidth: "200px",
              borderRadius: "4px",
              cursor: "pointer",
              backgroundColor: "white",
              paddingLeft: "6px",
              paddingRight: "6px",
            }}
          >
            <Typography fontWeight="bold">
              <span style={{ color: "grey" }}>Theme: </span>{selectedTheme}
            </Typography>
            <ExpandMoreRoundedIcon sx={{ color: "black" }} />
          </div>
          {isOpen && (
            <div
              ref={modalRef}
              id="style-1"
              style={{
                border: "1px solid #ccc",
                borderRadius: "4px",
                position: "absolute",
                marginTop: "5px",
                backgroundColor: "#F0F0F0",
                maxHeight: "200px",
                overflowY: "auto",
                width: "100%",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  cursor: "pointer",
                  backgroundColor: "#fff",
                  padding: "4px",
                }}
              >
                <div
                  style={{
                    paddingLeft: "6px",
                    paddingRight: "6px",
                    color: "white",
                    cursor: "pointer",
                    borderRadius: "4px",
                    backgroundColor: "#4D4D4D",
                  }}>
                  Select Themes
                </div>
              </div>
              {themes.map((theme, index) => (
                <div
                  key={index}
                  onClick={() => handleThemeChange(theme.name)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: "#fff",
                    padding: "4px",
                  }}
                >
                  <div
                    onMouseEnter={(e) => { e.target.style.backgroundColor = "#4D4D4D"; e.target.style.color = "white"; }}
                    onMouseLeave={(e) => { e.target.style.backgroundColor = "#fff"; e.target.style.color = "black"; }}
                    style={{
                      paddingLeft: "6px",
                      paddingRight: "6px",
                      color: "black",
                      cursor: "pointer",
                      borderRadius: "4px",
                    }}>
                    {theme.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Box>
      </Box>
      <div
        style={{
          border: "1px solid black",
          padding: "2px",
          position: "relative",
        }}
      >
        <textarea ref={editorRef}></textarea>
      </div>
    </Box >
  );
};

export default CodeEditor;
