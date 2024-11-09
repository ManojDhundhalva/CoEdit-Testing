import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAPI from "../hooks/api";
import { formatTimestamp } from "../utils/formatters";

import {
  IconButton,
  InputBase,
  Typography,
  Box,
  Container,
  Tooltip,
  TextField,
  InputAdornment,
  CircularProgress,
  Skeleton,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import GridOnRoundedIcon from "@mui/icons-material/GridOnRounded";
import SortByAlphaRoundedIcon from "@mui/icons-material/SortByAlphaRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AccountBoxRoundedIcon from '@mui/icons-material/AccountBoxRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';

const CustomDialog = ({ open, handleClose }) => {

  const { POST } = useAPI();

  const modalRef = useRef(null);

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [justVerify, setJustVerify] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();  // Close the modal if clicking outside of it
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on cleanup
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClose]);

  useEffect(() => {
    // Function to handle keydown event
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        handleClose(); // Call the function on pressing Escape
      }
    };

    // Add event listener for keydown
    document.addEventListener("keydown", handleEsc);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [handleClose]);

  if (!open) return null;

  const addProject = async (e) => {
    e.preventDefault();
    setJustVerify(true);

    if (projectName.trim() === "") return;

    setIsCreatingProject(true);
    try {
      const results = await POST("/project/add-project", { projectName });
      toast.success(results.data.message);
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong!");
    } finally {
      setIsCreatingProject(false);
    }
  };

  return (
    <Box ref={modalRef} sx={{
      minWidth: "300px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      position: "fixed",
      top: "50%",
      left: "50%",
      zIndex: 1000,
      bgcolor: "rgb(245, 245, 245)",
      transform: "translate(-50%, -50%)",
      p: 3,
      borderRadius: "10px",
      border: "1px solid #8C8C8C",
      // boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px"
    }}>
      <Box onClick={handleClose} sx={{
        m: 1,
        position: "absolute",
        top: 0,
        right: 0,
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <button style={{ padding: 0 }}>
          <CloseRoundedIcon fontSize="small" sx={{ color: "black" }} />
        </button>
      </Box>
      <Box sx={{ m: 3 }}>
        <Typography fontWeight="bold" fontSize="xx-large">Create Project</Typography>
      </Box>
      <form onSubmit={addProject} style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        <Box sx={{ m: 2 }}>
          <TextField
            autoFocus
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            id="project-name"
            label="Project Name"
            placeholder="Project Name"
            variant="outlined"
            fullWidth
            required
            size="small"
            autoComplete="off"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FolderRoundedIcon sx={{ color: "#333333" }} />
                </InputAdornment>
              ),
            }}
            error={
              justVerify && (projectName === "" || projectName.length >= 255)
            }
            helperText={
              justVerify &&
              (projectName === ""
                ? "This field cannot be empty."
                : projectName.length >= 255 ? "Project Name is too long." : "")
            }
            sx={{
              color: "black",
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                fontWeight: "bold",
                "&.Mui-focused fieldset": {
                  borderColor: "black", // Keep the border color when focused
                },
              },
              "& .MuiInputLabel-root": {
                color: "black", // Change the label color
                "&.Mui-focused": {
                  color: "black", // Change the label color
                },
              },
            }}
          />
        </Box>
        <Box sx={{ m: 1 }}>
          <button type="submit" onClick={addProject} style={{ fontWeight: "bold" }}>
            {isCreatingProject ? (
              <>
                Creating... &nbsp;&nbsp;
                <CircularProgress size={20} thickness={6}
                  sx={{
                    color: "black",
                    '& circle': { strokeLinecap: 'round' },
                  }}
                />
              </>
            ) : ("Create")}
          </button>
        </Box>
      </form>
    </Box >
  );
};

function ProjectPage() {
  const { GET } = useAPI();
  const navigate = useNavigate();

  const [allProjects, setAllProjects] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [isFetchingProjectsLoading, setIsFetchingProjectsLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleMenuToggle = (e, index) => {
    e.stopPropagation();
    document.getElementById(`menu-items-${index}`).style.display = document.getElementById(`menu-items-${index}`).style.display === "block" ? "none" : "block";
  };

  const handleInputChange = (e) => setSearchValue(e.target.value);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsFetchingProjectsLoading(true);
      try {
        const results = await GET("/project/get-all-projects");
        console.log(results.data)
        setAllProjects(results.data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Something went wrong!");
      } finally {
        setIsFetchingProjectsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Add a useEffect to listen for "Ctrl + /" and focus the search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        document.getElementById("search").focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleClickOutside = (event) => {
    document.querySelectorAll(".menu-items").forEach((menu) => {
      if (menu && !menu.contains(event.target)) {
        menu.style.display = "none";
      }
    });
  };

  const handleEscapePress = (event) => {
    if (event.key === "Escape") {
      document.querySelectorAll(".menu-items").forEach((menu) => {
        if (menu) {
          menu.style.display = "none";
        }
      });
    }
  };


  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapePress);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapePress);
    };
  }, []);

  const [isAscending, setIsAscending] = useState(true);
  const sortProjectsByName = () => {
    const sortedProjects = [...allProjects].sort((a, b) => {
      return isAscending
        ? a.project_name.localeCompare(b.project_name)
        : b.project_name.localeCompare(a.project_name);
    });
    setAllProjects(sortedProjects);
    setIsAscending(!isAscending);
  };


  return (
    <>
      <CustomDialog open={openDialog} handleClose={handleCloseDialog} />

      {/* header */}
      <Box sx={{ borderBottom: "1px solid rgb(100, 100, 100)", display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, py: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <DescriptionRoundedIcon fontSize="large" sx={{ color: "black" }} />
          <Typography fontWeight="bold" fontSize="x-large">
            CoEdit
          </Typography>
        </Box>
        <Box sx={{ minWidth: "34%" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              bgcolor: "#F2F2F2",
              borderRadius: 5,
              px: 2,
              py: "5px",
            }}
          >
            <SearchRoundedIcon sx={{ color: "black" }} />
            <InputBase
              autoFocus
              id="search"
              value={searchValue}
              onChange={handleInputChange}
              placeholder="Search (ctrl+/)"
              sx={{
                mx: 2,
                flexGrow: 1,
                fontSize: "1rem",
                bgcolor: "transparent",
                fontWeight: "bold",
              }}
            />
          </Box>
        </Box>
        <Box>
          <Tooltip title="profile"
            enterDelay={200}
            leaveDelay={0}
            componentsProps={{
              tooltip: {
                sx: {
                  bgcolor: "common.black",
                  "& .MuiTooltip-arrow": {
                    color: "common.black",
                  },
                },
              },
            }}>
            <button style={{ border: "none" }} onClick={() => navigate("/profile")}>
              <AccountBoxRoundedIcon sx={{ color: "black" }} fontSize="large" />
            </button>
          </Tooltip>
        </Box>
      </Box>

      {/* create-new-project */}
      <Box sx={{ my: 2 }}>
        <Box sx={{ px: 20, py: 5 }}>
          <Typography fontWeight="bold" fontSize="x-large">
            Create Workspace
          </Typography>
          <button style={{ width: "200px", height: "200px" }} onClick={handleOpenDialog}>
            <AddRoundedIcon sx={{ color: "black", fontSize: 100 }} />
          </button>
        </Box>
      </Box>

      {/* list-of-projects */}
      {allProjects.length === 0 ? (
        <Container maxWidth="lg" sx={{ mb: 10 }}>
          <table style={{ width: "100%", height: "100%" }}>
            <thead>
              <tr>
                <th style={{ width: "40%" }}>
                  <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                    <Typography fontWeight="bold">
                      Today
                    </Typography>
                  </Box>
                </th>
                <th>
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Typography fontWeight="bold">
                      Created On
                    </Typography>
                  </Box>
                </th>
                <th>
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Typography fontWeight="bold">
                      Last opened by me
                    </Typography>
                  </Box>
                </th>
                <th>
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Tooltip
                      title="Grid view"
                      leaveDelay={0}
                      componentsProps={{
                        tooltip: {
                          sx: {
                            bgcolor: "common.black",
                            color: "white",
                            transition: "none",
                          },
                        },
                      }}
                    >
                      <IconButton>
                        <GridOnRoundedIcon sx={{ color: "black" }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={isAscending ? "Sort A-Z" : "Sort Z-A"}
                      leaveDelay={0}
                      componentsProps={{
                        tooltip: {
                          sx: {
                            bgcolor: "common.black",
                            color: "white",
                            transition: "none",
                          },
                        },
                      }}>
                      <IconButton onClick={sortProjectsByName}>
                        <SortByAlphaRoundedIcon sx={{ color: "black" }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </th>
              </tr>
            </thead>
          </table>
          {isFetchingProjectsLoading ? (
            Array.from({ length: 5 }, (_, index) => (
              <Skeleton
                key={index}
                animation="wave"
                variant="rounded"
                height={60}
                sx={{ width: "100%", my: 1, bgcolor: "#E6E6E6" }}
              />
            ))
          ) : (
            <Typography fontWeight="bold" fontSize="large" sx={{ m: 4, textAlign: "center" }}>
              No projects found!
            </Typography>
          )}
        </Container>
      ) : (
        <Container maxWidth="lg" sx={{ mb: 10 }}>
          <table style={{ width: "100%", height: "100%" }}>
            <thead>
              <tr>
                <th style={{ width: "40%" }}>
                  <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                    <Typography fontWeight="bold">
                      Today
                    </Typography>
                  </Box>
                </th>
                <th>
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Typography fontWeight="bold">
                      Created On
                    </Typography>
                  </Box>
                </th>
                <th>
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Typography fontWeight="bold">
                      Last opened by me
                    </Typography>
                  </Box>
                </th>
                <th>
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Tooltip
                      title="Grid view"
                      leaveDelay={0}
                      componentsProps={{
                        tooltip: {
                          sx: {
                            bgcolor: "common.black",
                            color: "white",
                            transition: "none",
                          },
                        },
                      }}
                    >
                      <IconButton>
                        <GridOnRoundedIcon sx={{ color: "black" }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={isAscending ? "Sort A-Z" : "Sort Z-A"}
                      leaveDelay={0}
                      componentsProps={{
                        tooltip: {
                          sx: {
                            bgcolor: "common.black",
                            color: "white",
                            transition: "none",
                          },
                        },
                      }}>
                      <IconButton onClick={sortProjectsByName}>
                        <SortByAlphaRoundedIcon sx={{ color: "black" }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </th>
              </tr>
            </thead>
            <tbody>
              {allProjects?.map((project, index) => (
                <tr key={index} onClick={() => { navigate(`/project/${project.project_id}`) }}>
                  <td>
                    <Box sx={{ position: "relative", display: "flex", justifyContent: "flex-start" }}>
                      <Typography fontWeight="bold">
                        {project.project_name}
                      </Typography>
                    </Box>
                  </td>
                  <td>
                    <Box sx={{ position: "relative", display: "flex", justifyContent: "flex-end" }}>
                      <Typography>
                        {formatTimestamp(project.project_timestamp)}
                      </Typography>
                    </Box>
                  </td>
                  <td>
                    <Box sx={{ position: "relative", display: "flex", justifyContent: "flex-end" }}>
                      <Typography>
                        {formatTimestamp(project.last_opened)}
                      </Typography>
                    </Box>
                  </td>
                  <td>
                    <Box sx={{ position: "relative", display: "flex", justifyContent: "flex-end" }}>
                      <Tooltip
                        leaveDelay={0}
                        title={document.getElementById(`menu-items-${index}`)?.style.display === "flex" ? "" : "More"}
                        componentsProps={{
                          tooltip: {
                            sx: {
                              bgcolor: "common.black",
                              color: "white",
                              transition: "none",
                            },
                          },
                        }}
                      >
                        <IconButton onClick={(e) => { handleMenuToggle(e, index) }}>
                          <MoreVertIcon sx={{ color: "black" }} />
                        </IconButton>
                      </Tooltip>
                      <Box
                        className="menu-items"
                        id={`menu-items-${index}`}
                        sx={{
                          display: "none",
                          position: "absolute",
                          top: "100%",
                          left: "100%",
                          bgcolor: "white",
                          border: "1px solid #ddd",
                          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                          borderRadius: "4px",
                          zIndex: 1,
                          transform: "translate(-50%, 0)",
                        }}
                      >
                        <Box
                          onClick={() => console.log("Rename clicked")}
                          sx={{
                            p: 1,
                            display: "flex",
                            cursor: "pointer",
                            "&:hover": { bgcolor: "#f5f5f5" },
                          }}
                        >
                          <TextFieldsRoundedIcon />
                          <Typography sx={{ px: 1 }}>Rename</Typography>
                        </Box>
                        <Box
                          onClick={() => console.log("Delete clicked")}
                          sx={{
                            p: 1,
                            display: "flex",
                            cursor: "pointer",
                            "&:hover": { bgcolor: "#f5f5f5" },
                          }}
                        >
                          <DeleteRoundedIcon />
                          <Typography sx={{ px: 1 }}>Delete</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Container>)}
    </>
  );
}

export default ProjectPage;
