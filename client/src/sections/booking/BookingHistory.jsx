import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  CircularProgress,
  Grid,
  Divider,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormHelperText
} from '@mui/material';
import { format, parse, addHours, setHours, setMinutes, isSameDay } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { FiCalendar, FiClock, FiHome, FiX, FiAlertTriangle, FiEdit, FiMapPin, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import { routes, methods, apiUrl } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

// Booking Status Component
const BookingStatus = ({ status }) => {
  const getStatusColor = (status) => {
    // Convert to lowercase for case-insensitive comparison
    const statusLower = status?.toLowerCase() || '';
    
    switch (statusLower) {
      case 'success':
      case 'paid':  // Thêm 'paid' để xử lý status 'PAID' từ DB
        return 'success';
      case 'cancel':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    // Convert to lowercase for case-insensitive comparison
    const statusLower = status?.toLowerCase() || '';
    
    switch (statusLower) {
      case 'success':
      case 'paid':  // Thêm 'paid' để xử lý status 'PAID' từ DB
        return 'Success';
      case 'cancel':
        return 'Cancelled';
      case 'pending':
        return 'Pending';
      default:
        return status || 'Unknown';
    }
  };

  return (
    <Chip 
      label={getStatusLabel(status)} 
      color={getStatusColor(status)}
      size="small"
    />
  );
};

// Main Booking History Component
export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [courts, setCourts] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openChangeDialog, setOpenChangeDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'success' });
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [isUpdatingBooking, setIsUpdatingBooking] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const steps = [
    'Chọn sân',
    'Chọn thời gian'
  ];

  // Generate time slots from 6:00 to 22:00
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      slots.push({
        value: `${formattedHour}:00`,
        label: `${formattedHour}:00`
      });
    }
    return slots;
  };
  
  const timeSlots = generateTimeSlots();

  const fetchBookings = async () => {
    try {
      if (!user || !user._id) {
        setIsLoading(false);
        return;
      }

      const response = await axios.get(apiUrl(routes.BILL, methods.GET_ALL_BY_USER_ID, user._id));
      
      if (response.data.success) {
        setBookings(response.data.billsList || []);
      } else {
        setError(response.data.message || 'Failed to fetch booking history');
      }
    } catch (err) {
      console.error('Error fetching booking history:', err);
      setError('An error occurred while fetching your booking history');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourts = async () => {
    try {
      const response = await axios.get(apiUrl(routes.COURT, methods.GET_ALL));
      if (response.data.success) {
        setCourts(response.data.courtsList || []);
      } else {
        setAlertInfo({
          open: true,
          message: 'Failed to fetch courts',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error fetching courts:', err);
      setAlertInfo({
        open: true,
        message: 'An error occurred while fetching courts',
        severity: 'error'
      });
    }
  };

  const fetchAvailableTimeSlots = async (courtId, dateString) => {
    try {
      setIsLoadingTimeSlots(true);
      
      // Fetch all bills for the selected court
      const response = await axios.get(apiUrl(routes.BILL, methods.GET_ALL_BY_DATE, courtId));
      const allBills = response.data.billList || [];
      
      // Get bookings for the selected date, excluding the current booking being edited
      const bookedSlots = allBills.filter(bill => {
        if (!bill.time_rental || bill.status?.toLowerCase() === 'cancel') return false;
        
        try {
          // Parse the bill time
          const billTime = parse(bill.time_rental, "dd/MM/yyyy HH:mm:ss", new Date());
          const billDate = format(billTime, "yyyy-MM-dd");
          const selectedDateFormatted = format(new Date(dateString), "yyyy-MM-dd");
          
          // Check if the bill is for the selected date and is not the current booking being edited
          return billDate === selectedDateFormatted && 
                 (!selectedBooking || bill._id !== selectedBooking._id);
        } catch (err) {
          console.error('Error parsing date:', err);
          return false;
        }
      });
      
      // Create array of already booked hours for the selected date
      const bookedHours = bookedSlots.map(bill => {
        const billTime = parse(bill.time_rental, "dd/MM/yyyy HH:mm:ss", new Date());
        return billTime.getHours();
      });
      
      // Filter available time slots
      const availableSlots = timeSlots.filter(slot => {
        const [hours] = slot.value.split(':').map(Number);
        return !bookedHours.includes(hours);
      });
      
      setAvailableTimeSlots(availableSlots);
    } catch (err) {
      console.error('Error fetching available time slots:', err);
      setAlertInfo({
        open: true,
        message: 'Failed to fetch available time slots',
        severity: 'error'
      });
      setAvailableTimeSlots([]);
    } finally {
      setIsLoadingTimeSlots(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchCourts();
  }, [user]);

  useEffect(() => {
    if (selectedCourt && selectedDate) {
      fetchAvailableTimeSlots(selectedCourt, selectedDate);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedCourt, selectedDate]);

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setOpenCancelDialog(true);
  };

  const handleChangeClick = (booking) => {
    setSelectedBooking(booking);
    // Reset form state
    setActiveStep(0);
    setSelectedCourt(booking.court_id?._id || '');
    
    // Parse the booking time
    if (booking.time_rental) {
      try {
        const dateObj = parse(booking.time_rental, "dd/MM/yyyy HH:mm:ss", new Date());
        setSelectedDate(format(dateObj, "yyyy-MM-dd")); // Format as YYYY-MM-DD for input
        setSelectedTimeSlot(format(dateObj, "HH:mm"));
      } catch (err) {
        console.error('Error parsing date:', err);
        setSelectedDate(format(new Date(), "yyyy-MM-dd"));
        setSelectedTimeSlot('');
      }
    } else {
      setSelectedDate(format(new Date(), "yyyy-MM-dd"));
      setSelectedTimeSlot('');
    }
    
    setOpenChangeDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenCancelDialog(false);
    setOpenChangeDialog(false);
    setSelectedBooking(null);
    setActiveStep(0);
    setAvailableTimeSlots([]);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    
    try {
      // Use the update-status endpoint
      const response = await axios.put(
        apiUrl(routes.BILL, methods.UPDATE_STATUS, selectedBooking._id), 
        { status: 'cancel' }
      );
      
      if (response.data.success) {
        // Update local state
        setBookings(bookings.map(booking => 
          booking._id === selectedBooking._id 
            ? { ...booking, status: 'cancel' } 
            : booking
        ));
        setAlertInfo({
          open: true,
          message: 'Booking cancelled successfully',
          severity: 'success'
        });
      } else {
        setAlertInfo({
          open: true,
          message: response.data.message || 'Failed to cancel booking',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setAlertInfo({
        open: true,
        message: err.response?.data?.message || 'An error occurred while cancelling the booking',
        severity: 'error'
      });
    }
    
    handleCloseDialog();
  };

  const handleConfirmBookingChange = async () => {
    if (!selectedBooking || !selectedCourt || !selectedDate || !selectedTimeSlot) {
      setAlertInfo({
        open: true,
        message: 'Vui lòng chọn đầy đủ sân và thời gian',
        severity: 'error'
      });
      return;
    }

    try {
      setIsUpdatingBooking(true);
      
      // Parse the selected date and time
      const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
      
      // Create a date object with the selected date and time
      const dateObj = new Date(selectedDate);
      dateObj.setHours(hours, minutes, 0);
      
      // Format for API in "dd/MM/yyyy HH:mm:ss" format
      const formattedDateTime = format(dateObj, "dd/MM/yyyy HH:mm:ss");
      const endDateTime = format(addHours(dateObj, 1), "dd/MM/yyyy HH:mm:ss");
      
      // Make sure to have a valid price
      let price = selectedBooking.retal_price; // Default to current price
      
      // Prepare update data - simplified to avoid potential issues
      const updateData = {
        court_id: selectedCourt,
        time_rental: formattedDateTime,
        end_time_rental: endDateTime,
        retal_price: Number(price) // Ensure it's a number
      };
      
      console.log('Sending update data:', JSON.stringify(updateData, null, 2));
      
      // Call the API to update the booking
      const response = await axios.put(
        apiUrl(routes.BILL, methods.CHANGE_BOOKING, selectedBooking._id),
        updateData
      );
      
      if (response.data.success) {
        console.log('Update successful:', response.data);
        
        // Update local state
        fetchBookings(); // Refresh booking list
        
        setAlertInfo({
          open: true,
          message: 'Đã cập nhật lịch đặt sân thành công',
          severity: 'success'
        });
        
        // Close the dialog
        handleCloseDialog();
      } else {
        console.error('Server returned failure:', response.data);
        setAlertInfo({
          open: true,
          message: response.data.message || 'Không thể cập nhật lịch đặt sân',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error updating booking:', err);
      
      // Chi tiết về lỗi
      let errorMessage = 'Đã xảy ra lỗi khi cập nhật lịch đặt sân';
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Status code:', err.response.status);
        
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.status === 500) {
          errorMessage = 'Lỗi máy chủ nội bộ, vui lòng thử lại sau';
        }
      } else if (err.request) {
        errorMessage = 'Không nhận được phản hồi từ máy chủ';
      } else {
        errorMessage = err.message;
      }
      
      setAlertInfo({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsUpdatingBooking(false);
    }
  };

  const closeAlert = () => {
    setAlertInfo({ ...alertInfo, open: false });
  };

  // Function to check if booking can be modified
  const canModifyBooking = (booking) => {
    if (!booking || !booking.status) return false;
    
    // Convert to lowercase for case-insensitive comparison
    const status = booking.status.toLowerCase();
    
    // Allow modifications if booking is in success/paid status
    return status !== 'cancel' && (status === 'success' || status === 'paid');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dateString;
  };

  // Step 1: Court Selection Form
  const renderCourtSelectionForm = () => (
    <Box sx={{ mt: 2 }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="court-select-label">Sân</InputLabel>
        <Select
          labelId="court-select-label"
          value={selectedCourt}
          onChange={(e) => setSelectedCourt(e.target.value)}
          label="Sân"
          required
        >
          <MenuItem value=""><em>Chọn sân</em></MenuItem>
          {courts.map((court) => (
            <MenuItem key={court._id} value={court._id}>
              {court.court_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={handleCloseDialog} sx={{ mr: 1 }}>
          Hủy
        </Button>
        <Button 
          onClick={handleNext} 
          variant="contained" 
          color="primary"
          disabled={!selectedCourt}
        >
          Tiếp theo
        </Button>
      </Box>
    </Box>
  );

  // Step 2: Time Selection Form
  const renderTimeSelectionForm = () => (
    <Box sx={{ mt: 2 }}>
      <TextField
        label="Ngày"
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputLabelProps={{
          shrink: true,
        }}
        inputProps={{
          min: format(new Date(), 'yyyy-MM-dd') // Today's date as minimum
        }}
      />
      
      {isLoadingTimeSlots ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : selectedDate && availableTimeSlots.length > 0 ? (
        <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Khung giờ trống
          </Typography>
          <RadioGroup
            value={selectedTimeSlot}
            onChange={(e) => setSelectedTimeSlot(e.target.value)}
          >
            <Grid container spacing={1}>
              {availableTimeSlots.map((slot) => (
                <Grid item xs={4} key={slot.value}>
                  <FormControlLabel
                    value={slot.value}
                    control={<Radio />}
                    label={slot.label}
                    sx={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1, 
                      p: 1, 
                      width: '100%',
                      m: 0
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </RadioGroup>
        </FormControl>
      ) : selectedDate ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Không có khung giờ nào khả dụng cho ngày đã chọn. Vui lòng chọn ngày khác.
        </Alert>
      ) : (
        <FormHelperText>Vui lòng chọn ngày để xem các khung giờ có sẵn</FormHelperText>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={handleBack} sx={{ mr: 1 }}>
          Quay lại
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirmBookingChange}
          disabled={!selectedTimeSlot || isUpdatingBooking}
          startIcon={isUpdatingBooking ? <CircularProgress size={20} /> : <FiCheck />}
        >
          {isUpdatingBooking ? 'Đang cập nhật...' : 'Xác nhận thay đổi'}
        </Button>
      </Box>
    </Box>
  );

  // Booking Item Component
  const BookingItem = ({ booking }) => (
    <TableRow sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
      <TableCell>
        {booking.court_id ? booking.court_id.court_name : 'N/A'}
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FiClock style={{ marginRight: '8px' }} /> 
          {formatDate(booking.time_rental)}
        </Box>
      </TableCell>
      <TableCell>
        <BookingStatus status={booking.status} />
      </TableCell>
      <TableCell align="right">
        {canModifyBooking(booking) && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button 
              variant="outlined" 
              color="primary" 
              size="small" 
              startIcon={<FiEdit />}
              onClick={() => handleChangeClick(booking)}
            >
              Change
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              size="small" 
              startIcon={<FiX />}
              onClick={() => handleCancelClick(booking)}
            >
              Cancel
            </Button>
          </Box>
        )}
      </TableCell>
    </TableRow>
  );

  // Empty State Component
  const EmptyBookings = () => (
    <Card sx={{ p: 4, textAlign: 'center', marginTop: 3 }}>
      <FiCalendar size={40} style={{ marginBottom: '16px', color: '#9e9e9e' }} />
      <Typography variant="h6" gutterBottom>No Bookings Found</Typography>
      <Typography variant="body2" color="text.secondary">
        You don't have any court bookings yet. Book a court to see your history here.
      </Typography>
    </Card>
  );

  // Loading Component
  const LoadingState = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', flexDirection: 'column' }}>
      <CircularProgress size={40} sx={{ mb: 2 }} />
      <Typography variant="body1" color="text.secondary">Loading your bookings...</Typography>
    </Box>
  );

  // Error Component
  const ErrorState = ({ message }) => (
    <Card sx={{ p: 3, textAlign: 'center', bgcolor: '#ffebee', marginTop: 3 }}>
      <Typography color="error" variant="subtitle1">
        {message}
      </Typography>
    </Card>
  );

  // Render based on state
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <Helmet>
        <title>Booking History</title>
      </Helmet>

      <Container maxWidth="xl">
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
              <FiCalendar style={{ marginRight: '12px' }} /> Booking History
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<FiHome />}
              onClick={() => navigate('/courts')}
            >
              Back to Homepage
            </Button>
          </Box>
          <Divider />
        </Box>
        
        {/* Content Area */}
        {error ? (
          <ErrorState message={error} />
        ) : bookings.length === 0 ? (
          <EmptyBookings />
        ) : (
          <Card sx={{ overflow: 'hidden' }}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Court</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Booking Time</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => (
                    <BookingItem key={booking._id} booking={booking} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {/* Summary Section */}
        {bookings.length > 0 && (
          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Total Bookings</Typography>
                <Typography variant="h5">{bookings.length}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Successful</Typography>
                <Typography variant="h5">
                  {bookings.filter(b => {
                    const status = b.status?.toLowerCase();
                    return status === 'success' || status === 'paid';
                  }).length}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Cancelled</Typography>
                <Typography variant="h5">
                  {bookings.filter(b => b.status?.toLowerCase() === 'cancel').length}
                </Typography>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Cancel Confirmation Dialog */}
        <Dialog
          open={openCancelDialog}
          onClose={handleCloseDialog}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FiAlertTriangle style={{ marginRight: '8px', color: '#f44336' }} /> 
              Confirm Cancellation
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to cancel this booking? This action cannot be undone.
              {selectedBooking && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Court:</strong> {selectedBooking.court_id?.court_name || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Booking Time:</strong> {formatDate(selectedBooking.time_rental)}
                  </Typography>
                </Box>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Keep Booking
            </Button>
            <Button onClick={handleConfirmCancel} color="error" variant="contained">
              Yes, Cancel Booking
            </Button>
          </DialogActions>
        </Dialog>

        {/* Change Booking Dialog */}
        <Dialog
          open={openChangeDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FiEdit style={{ marginRight: '8px', color: '#1976d2' }} /> 
              Thay đổi lịch đặt sân
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stepper activeStep={activeStep} sx={{ mt: 2, mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {selectedBooking && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Thông tin hiện tại:
                </Typography>
                <Box sx={{ mt: 1, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Sân:</strong> {selectedBooking.court_id?.court_name || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Thời gian:</strong> {formatDate(selectedBooking.time_rental)}
                  </Typography>
                </Box>
              </Box>
            )}
            
            {activeStep === 0 && renderCourtSelectionForm()}
            {activeStep === 1 && renderTimeSelectionForm()}
          </DialogContent>
        </Dialog>

        {/* Alert Snackbar */}
        <Snackbar 
          open={alertInfo.open} 
          autoHideDuration={6000} 
          onClose={closeAlert}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={closeAlert} severity={alertInfo.severity} sx={{ width: '100%' }}>
            {alertInfo.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}