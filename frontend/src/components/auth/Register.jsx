// module-imports
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

//imported
import useAPI from "../../hooks/api";
import { isValidEmail as checkEmail } from "../../utils/validation";

//Material UI Components
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

//Material UI Icons
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonIcon from "@mui/icons-material/Person";
import VpnKeyRoundedIcon from "@mui/icons-material/VpnKeyRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";

export default function RegisterPage() {

    const { POST } = useAPI();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [justVerify, setJustVerify] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isValidEmail, setIsValidEmail] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [userName, setUserName] = useState("");
    const [emailId, setEmailId] = useState("");
    const [password, setPassword] = useState("");

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (e) => e.preventDefault();

    const handleEmailChange = (e) => {
        setEmailId((prev) => e.target.value);
        setIsValidEmail(checkEmail(e.target.value));
    };

    const isFormValid = () => {
        return (
            firstName.trim() !== "" ||
            firstName.length < 255 ||
            lastName.trim() !== "" ||
            lastName.length < 255 ||
            userName.trim() !== "" ||
            userName.length < 255 ||
            emailId.trim() !== "" ||
            emailId.length < 255 ||
            isValidEmail ||
            password !== "" ||
            password.length >= 8 ||
            password.length < 255
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setJustVerify((prev) => true);

        if (!isFormValid()) return;

        setLoading((prev) => true);

        const registerCredentials = {
            firstname: firstName,
            lastname: lastName,
            username: userName,
            emailid: emailId,
            password,
        };

        try {
            await POST("/register", registerCredentials);
            toast.success("Account Created successfully!");
            navigate("/");
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong!");
        } finally {
            setLoading((prev) => false);
        }
    };

    return (
        <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{
                minHeight: "100vh",
                paddingX: { xs: 2, sm: 4 },
                paddingY: { xs: 4, sm: 6 },
                background:
                    "radial-gradient(788px at 0.7% 3.4%, rgb(164, 231, 192) 0%, rgb(255, 255, 255) 90%)",
                backgroundSize: "cover",
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
                    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                    backdropFilter: "blur(12px)",
                    backgroundColor: "transparent",
                }}
            >
                <Avatar sx={{ backgroundColor: "#134611", mb: 2 }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography variant="h5" fontWeight="bold" mb={2}>
                    Sign Up
                </Typography>
                <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                color="success"
                                value={firstName}
                                onChange={(e) => {
                                    setFirstName((prev) => e.target.value);
                                }}
                                id="first-name"
                                label="First Name"
                                placeholder="First Name"
                                variant="outlined"
                                fullWidth
                                required
                                size="small"
                                autoComplete="on"
                                error={
                                    justVerify && (firstName === "" || firstName.length >= 255)
                                }
                                helperText={
                                    justVerify &&
                                    (firstName === ""
                                        ? "This field cannot be empty."
                                        : firstName.length >= 255
                                            ? "First Name is too long"
                                            : "")
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
                                value={lastName}
                                onChange={(e) => {
                                    setLastName((prev) => e.target.value);
                                }}
                                id="last-name"
                                label="Last Name"
                                placeholder="Last Name"
                                variant="outlined"
                                fullWidth
                                required
                                size="small"
                                autoComplete="on"
                                error={
                                    justVerify && (lastName === "" || lastName.length >= 255)
                                }
                                helperText={
                                    justVerify &&
                                    (lastName === ""
                                        ? "This field cannot be empty."
                                        : lastName.length >= 255
                                            ? "Last Name is too long"
                                            : "")
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
                                value={userName}
                                onChange={(e) => {
                                    setUserName((prev) => e.target.value);
                                }}
                                id="username"
                                label="Username"
                                placeholder="Username"
                                variant="outlined"
                                fullWidth
                                required
                                size="small"
                                autoComplete="on"
                                error={
                                    justVerify && (userName === "" || userName.length >= 255)
                                }
                                helperText={
                                    justVerify &&
                                    (userName === ""
                                        ? "This field cannot be empty."
                                        : userName.length >= 255
                                            ? "username is too long"
                                            : "")
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
                                value={emailId}
                                onChange={handleEmailChange}
                                id="email-id"
                                label="Email ID"
                                placeholder="Email ID"
                                variant="outlined"
                                fullWidth
                                required
                                size="small"
                                autoComplete="on"
                                error={justVerify && (emailId === "" || emailId.length >= 255)}
                                helperText={
                                    justVerify &&
                                    (emailId === ""
                                        ? "This field cannot be empty."
                                        : emailId.length >= 255
                                            ? "Email ID is too long"
                                            : "")
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailRoundedIcon sx={{ color: "#134611" }} />
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
                                onChange={(e) => {
                                    setPassword((prev) => e.target.value);
                                }}
                                id="password"
                                label="Password"
                                placeholder="password"
                                variant="outlined"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                fullWidth
                                required
                                size="small"
                                autoComplete="on"
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
                                            ? "The password must contain at least 8 characters."
                                            : password.length >= 255
                                                ? "The password is too long"
                                                : "")
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
                                                onClick={handleClickShowPassword}
                                                onMouseDown={handleMouseDownPassword}
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
                                        color: "white",
                                        backgroundColor: "#155d27",
                                    },
                                }}
                            >
                                {!loading ? "Sign Up" : "Signing Up"}
                                {loading && <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>}
                                {loading && (
                                    <CircularProgress
                                        size={20}
                                        sx={{
                                            color: "white",
                                            right: 0,
                                        }}
                                    />
                                )}
                            </Button>
                        </Grid>
                        <Grid item container justifyContent="space-between" xs={12}>
                            <Button
                                variant="text"
                                onClick={() => {
                                    navigate("/login");
                                }}
                                sx={{
                                    fontWeight: "bold",
                                    color: "#134611",
                                    textDecoration: "underline",
                                }}
                            >
                                Already have an account? Sign In
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Grid>
        </Grid>
    );
}
