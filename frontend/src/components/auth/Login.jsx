// module-imports
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

//imported
import useAPI from "../../hooks/api";

// Material-UI components
import {
    Grid,
    Avatar,
    Button,
    TextField,
    Typography,
    IconButton,
    InputAdornment,
    CircularProgress,
} from "@mui/material";

// Material-UI icons
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonIcon from "@mui/icons-material/Person";
import VpnKeyRoundedIcon from "@mui/icons-material/VpnKeyRounded";

export default function Login({ hasAccount, setHasAccount }) {

    const { POST } = useAPI();
    const navigate = useNavigate();

    // State
    const [loading, setLoading] = useState(false);
    const [justVerify, setJustVerify] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");

    // Toggle password visibility
    const handleTogglePasswordVisibility = () => setShowPassword((prev) => !prev);

    // Prevent default behavior for password visibility toggle
    const handlePasswordMouseDown = (event) => event.preventDefault();

    // Validate form inputs
    const isFormValid = () => {
        return (
            userName.trim() !== "" &&
            userName.length < 255 &&
            password.length >= 8 &&
            password.length < 255
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setJustVerify(true);

        if (!isFormValid()) return;

        setLoading(true);

        const credentials = { username: userName, password };

        try {
            await POST("/login", credentials);
            toast.success("Login successful!");
            navigate("/");
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{
                display: hasAccount ? "flex" : "none",
                minHeight: "100vh",
                paddingX: { xs: 2, sm: 4 },
                paddingY: { xs: 4, sm: 6 },
                background: "radial-gradient(circle, rgb(164, 231, 192), white 90%)",
            }}
        >
            <Grid
                item
                xs={12}
                sm={8}
                md={6}
                lg={4}
                sx={{
                    padding: { xs: 2, sm: 4 },
                    borderRadius: "16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.24)",
                    backdropFilter: "blur(12px)",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                }}
            >
                <Avatar sx={{ backgroundColor: "#134611", mb: 2 }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography variant="h5" fontWeight="bold" mb={2}>
                    Sign in
                </Typography>
                <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                color="success"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                id="username"
                                label="Username / Email ID"
                                placeholder="Username OR Email-ID"
                                variant="outlined"
                                fullWidth
                                required
                                size="small"
                                error={
                                    justVerify && (userName === "" || userName.length >= 255)
                                }
                                helperText={
                                    justVerify &&
                                    (userName === ""
                                        ? "This field cannot be empty."
                                        : userName.length >= 255 ? "Username is too long." : "")
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon sx={{ color: "#134611" }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 25,
                                        fontWeight: "bold",
                                    },
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                color="success"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                id="password"
                                label="Password"
                                placeholder="Password"
                                variant="outlined"
                                type={showPassword ? "text" : "password"}
                                fullWidth
                                required
                                size="small"
                                error={
                                    justVerify &&
                                    (password === "" ||
                                        password.length >= 255 ||
                                        password.length < 8)
                                }
                                helperText={
                                    justVerify &&
                                    (password === ""
                                        ? "This field cannot be empty."
                                        : password.length < 8
                                            ? "Password must contain at least 8 characters."
                                            : password.length >= 255 ? "Password is too long." : "")
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <VpnKeyRoundedIcon sx={{ color: "#134611" }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleTogglePasswordVisibility}
                                                onMouseDown={handlePasswordMouseDown}
                                                edge="end"
                                            >
                                                {showPassword ? (
                                                    <Visibility sx={{ color: "#134611" }} />
                                                ) : (
                                                    <VisibilityOff sx={{ color: "#134611" }} />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 25,
                                        fontWeight: "bold",
                                    },
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                sx={{
                                    fontWeight: "bold",
                                    borderRadius: "12px",
                                    backgroundColor: "#134611",
                                    color: "white",
                                    "&:hover": {
                                        backgroundColor: "#155d27",
                                    },
                                }}
                            >
                                {loading ? (
                                    <>
                                        Signing In&nbsp;&nbsp;
                                        <CircularProgress size={20} sx={{ color: "white" }} />
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </Grid>

                        <Grid item xs={12} container justifyContent="space-between">
                            <Button
                                variant="text"
                                onClick={() => setHasAccount(false)}
                                sx={{
                                    fontWeight: "bold",
                                    color: "#134611",
                                    textDecoration: "underline",
                                }}
                            >
                                Don't have an account? Sign Up
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Grid>
        </Grid>
    );
}
