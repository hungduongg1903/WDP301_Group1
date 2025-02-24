import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import {
  TextField,
  Button,
  CircularProgress,
  Typography,
  Link,
  Box,
} from "@mui/material";
import { Mail, Lock } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = await login(email, password);
    // Get the user data from localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    if (user !== null) {
      // Check if the user is an admin
      if (user.isAdmin) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/courts";
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh", // Ensure it covers the entire screen height
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          maxWidth: 400,
          width: "100%",
          padding: 4,
          backgroundColor: "white", // White background for the form
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: "bold",
            marginBottom: 3,
            background:
              "linear-gradient(to right,rgb(52, 137, 211),rgb(16, 134, 185))",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Welcome Back
        </Typography>

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: <Mail sx={{ color: "gray", marginRight: 1 }} />,
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: <Lock sx={{ color: "gray", marginRight: 1 }} />,
            }}
          />

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            marginBottom={2}
          >
            <Link href="/forgot-password" variant="body2" color="textSecondary">
              Forgot password?
            </Link>
          </Box>

          {error && (
            <Typography color="error" variant="body2" gutterBottom>
              {error}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            color="success"
            type="submit"
            disabled={isLoading}
            sx={{
              padding: "12px 0",
              fontWeight: "bold",
              marginTop: 2,
              background:
                "linear-gradient(to right,rgb(52, 137, 211),rgb(16, 134, 185))",
              "&:hover": { backgroundColor: "#10b981" },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Login"
            )}
          </Button>
        </form>

        <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Don't have an account?{" "}
            <Link href="/signup" color="rgb(52, 137, 211)">
              Sign up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
