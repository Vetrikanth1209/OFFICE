import React, { useState } from "react";
import styled from "styled-components";
import { Avatar, Button, CssBaseline, TextField, Box, Container, Typography, InputAdornment } from "@mui/material";
import { AccountCircle, Lock, Person } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import logo from "./MEC.png";
import { postsignin } from './axios';

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const BoxContainer = styled.div`
  width: 400px;
  min-height: 550px;
  display: flex;
  flex-direction: column;
  border-radius: 19px;
  background-color: #fff;
  box-shadow: 0 0 2px rgba(15, 15, 15, 0.28);
  position: relative;
  overflow: hidden;
`;

const TopContainer = styled.div`
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 1.8em;
  padding-bottom: 90px;
  position: relative;
`;

const BackDrop = styled.div`
  position: absolute;
  width: 160%;
  height: 550px;
  display: flex;
  flex-direction: column;
  border-radius: 50%;
  top: -320px;
  left: -100px;
  transform: rotate(60deg);
  background: #32348c;
`;

const HeaderContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const HeaderText = styled.div`
  font-size: 30px;
  font-weight: 600;
  line-height: 1.24;
  color: #fff;
  z-index: 50;
`;

const SmallText = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  z-index: 10;
`;

const PersonIconWrapper = styled.div`
  position: absolute;
  top: 160px;
  left: 180px;
  opacity: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 60px;
`;

const SignIn = () => {
  const defaultTheme = createTheme();
  const [users, setUsers] = useState({
    username: "",
    password: ""
  });

  const collect = (eve) => {
    const { name, value } = eve.target;
    setUsers((old) => ({
      ...old,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const userData = {
        username: users.username,
        password: users.password,
    };
  
    try {
        const res = await postsignin(userData);
        console.log("Server Response:", res);
  
        if (res.data.username) {
            sessionStorage.setItem("logged", JSON.stringify(userData));
            sessionStorage.setItem("admin", res.data.admin);
            window.location.assign("/");
        } else {
            alert("Failed to sign in. Please check your credentials.");
        }
    } catch (err) {
        console.error("Error during sign-in:", err);
        alert("Sign-in failed. Please try again.");
    }
  };
  

  const clearFields = () => {
    setUsers({
      username: "",
      password: ""
    });
    sessionStorage.removeItem("logged");
  };

  return (
    <PageContainer>
      <BoxContainer>
        <TopContainer>
          <BackDrop />
          <PersonIconWrapper>
            <Person style={{ fontSize: 240, color: "#fff" }} />
          </PersonIconWrapper>
          <HeaderContainer>
            <HeaderText>Welcome Back !!!</HeaderText>
            <SmallText>Please sign-in to continue!</SmallText>
          </HeaderContainer>
          <img
            src={logo}
            alt="logo"
            style={{
              position: "absolute",
              top: 50,
              right: 30,
              maxHeight: "35%",
              maxWidth: "35%",
              zIndex: 100,
            }}
          />
        </TopContainer>
        <div style={{ paddingTop: "50px" }}>
          <ThemeProvider theme={defaultTheme}>
            <Container
              component="main"
              maxWidth="xs"
              style={{
                backgroundColor: "#ffffff",
                padding: "20px",
                borderRadius: "10px",
              }}
            >
              <CssBaseline />
              <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit}>
                <TextField
                  label="Username"
                  name="username"
                  onChange={collect}
                  value={users.username}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  onChange={collect}
                  value={users.password}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 1,
                    mb: 2,
                    borderRadius: 20,
                    backgroundColor: "#32348c",
                    color: "#fff",
                  }}
                >
                  Sign In
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    mb: 2,
                    borderRadius: 20,
                    color: "#32348c",
                  }}
                  onClick={clearFields}
                >
                  Clear
                </Button>
              </Box>
            </Container>
          </ThemeProvider>
        </div>
      </BoxContainer>
    </PageContainer>
  );
};

export default SignIn;
