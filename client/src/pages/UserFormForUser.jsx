import {
  Box,
  Button,
  Container,
  Grid,
  Modal,
  Stack,
  TextField,
  Typography,
  useTheme,
  alpha,
  Divider,
  Paper,
  InputAdornment,
  Fade,
  Backdrop
} from '@mui/material';
import PropTypes from 'prop-types';
import Iconify from '../components/iconify';

const UserForm = ({ isUpdateForm, isModalOpen, handleCloseModal, user, setUser, handleAddUser, handleUpdateUser }) => {
  const theme = useTheme();
  
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 800 },
    maxHeight: '90vh',
    overflowY: 'auto',
    bgcolor: 'background.paper',
    borderRadius: '20px',
    boxShadow: 24,
    p: 0,
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: alpha(theme.palette.primary.main, 0.2),
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: alpha(theme.palette.grey[200], 0.5),
      borderRadius: '4px',
    },
  };

  const formHeaderStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    py: 2.5,
    px: 3,
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    color: 'white',
    boxShadow: theme.shadows[3],
  };

  const formContentStyle = {
    p: { xs: 2, sm: 4 },
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
      },
      '&.Mui-focused': {
        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
      },
    },
    '& .MuiInputLabel-root': {
      '&.Mui-focused': {
        color: theme.palette.primary.main,
      },
    },
  };

  const buttonStyle = {
    base: {
      borderRadius: '12px',
      px: 3,
      py: 1.2,
      fontWeight: 'bold',
      transition: 'all 0.3s',
      minWidth: 120,
    },
    primary: {
      boxShadow: theme.shadows[4],
      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: theme.shadows[8],
        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
      },
    },
    cancel: {
      boxShadow: theme.shadows[2],
      background: alpha(theme.palette.grey[300], 0.8),
      color: theme.palette.text.primary,
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: theme.shadows[4],
        background: alpha(theme.palette.grey[400], 0.8),
      },
    },
  };

  return (
    <Modal
      open={isModalOpen}
      onClose={handleCloseModal}
      aria-labelledby="user-form-modal"
      aria-describedby="form-to-add-or-update-user"
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
          sx: {
            backgroundColor: alpha(theme.palette.background.default, 0.8),
            backdropFilter: 'blur(4px)',
          },
        },
      }}
    >
      <Fade in={isModalOpen}>
        <Box sx={modalStyle}>
          {/* Header */}
          <Box sx={formHeaderStyle}>
            <Typography 
              variant="h4" 
              textAlign="center"
              sx={{ 
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                letterSpacing: '0.5px',
              }}
            >
              {isUpdateForm ? 'Update Profile' : 'Add User'}
            </Typography>
          </Box>
          
          {/* Form Content */}
          <Box sx={formContentStyle}>
            <Container>
              <Stack spacing={4} paddingY={2}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.6),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      mb: 2, 
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Iconify icon="eva:person-outline" width={20} height={20} sx={{ mr: 1 }} />
                    Personal Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <TextField
                        fullWidth
                        name="name"
                        label="Full Name"
                        value={user.name}
                        autoFocus
                        required
                        onChange={(e) =>
                          setUser({
                            ...user,
                            name: e.target.value,
                          })
                        }
                        sx={inputStyle}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Iconify icon="eva:person-fill" width={20} height={20} sx={{ color: theme.palette.primary.main }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        name="dob"
                        label="Date of Birth"
                        type="date"
                        value={user.dob}
                        InputLabelProps={{ shrink: true }}
                        onChange={(e) => setUser({ ...user, dob: e.target.value })}
                        sx={inputStyle}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Iconify icon="eva:calendar-fill" width={20} height={20} sx={{ color: theme.palette.primary.main }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.6),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      mb: 2, 
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Iconify icon="eva:phone-call-outline" width={20} height={20} sx={{ mr: 1 }} />
                    Contact Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="email"
                        label="Email Address"
                        type="email"
                        value={user.email}
                        required
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                        disabled
                        sx={{
                          ...inputStyle,
                          '& .MuiOutlinedInput-root.Mui-disabled': {
                            backgroundColor: alpha(theme.palette.action.disabled, 0.1),
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Iconify icon="eva:email-fill" width={20} height={20} sx={{ color: theme.palette.action.disabled }} />
                            </InputAdornment>
                          ),
                        }}
                        helperText="Email cannot be changed"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="phone"
                        label="Phone Number"
                        type="number"
                        value={user.phone}
                        onChange={(e) => setUser({ ...user, phone: e.target.value })}
                        sx={inputStyle}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Iconify icon="eva:phone-fill" width={20} height={20} sx={{ color: theme.palette.primary.main }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.6),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      mb: 2, 
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Iconify icon="eva:lock-outline" width={20} height={20} sx={{ mr: 1 }} />
                    Security
                  </Typography>
                  
                  <TextField
                    fullWidth
                    name="password"
                    type="password"
                    label="Password"
                    value={user.password}
                    required
                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                    sx={inputStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="eva:lock-fill" width={20} height={20} sx={{ color: theme.palette.primary.main }} />
                        </InputAdornment>
                      ),
                    }}
                    helperText={isUpdateForm ? "Enter your password to confirm changes" : "Create a strong password"}
                  />
                </Paper>

                <Divider sx={{ my: 1 }} />

                {/* Action Buttons */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    gap: 2,
                    flexWrap: 'wrap',
                    mb: 2,
                  }}
                >
                  <Button
                    size="large"
                    variant="contained"
                    onClick={isUpdateForm ? handleUpdateUser : handleAddUser}
                    startIcon={<Iconify icon="bi:check-lg" />}
                    sx={{
                      ...buttonStyle.base,
                      ...buttonStyle.primary,
                    }}
                  >
                    {isUpdateForm ? 'Update' : 'Submit'}
                  </Button>

                  <Button
                    size="large"
                    variant="contained"
                    onClick={handleCloseModal}
                    startIcon={<Iconify icon="charm:cross" />}
                    sx={{
                      ...buttonStyle.base,
                      ...buttonStyle.cancel,
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Stack>
            </Container>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

UserForm.propTypes = {
  isUpdateForm: PropTypes.bool,
  isModalOpen: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  user: PropTypes.object,
  setUser: PropTypes.func,
  handleAddUser: PropTypes.func,
  handleUpdateUser: PropTypes.func,
};

export default UserForm;
