"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import {
  Box,
  Typography,
  CircularProgress,
  Stack,
  Modal,
  Paper,
  Button,
  Divider,
  useTheme,
  alpha,
  Grid,
  Card,
  CardContent,
  IconButton,
} from "@mui/material"
import toast from "react-hot-toast"
import Iconify from "../components/iconify"
import Label from "../components/label"

export default function BookingHistoryModal({ isOpen, onClose, userId }) {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const theme = useTheme()

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "90%", sm: "80%", md: "90%" },
    maxWidth: 1200,
    maxHeight: "90vh",
    overflow: "auto",
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 24,
    p: { xs: 2, sm: 4 },
  }

  const getBills = async () => {
    if (!userId || !isOpen) return
    
    setLoading(true)
    // Tạo URL theo đúng cấu trúc backend API
    const url = `http://localhost:8080/api/bill/getAll/user/${userId}`
    console.log("Calling API:", url)

    try {
      const response = await axios.get(url, { withCredentials: true })
      const allBills = response.data.billsList || []
      
      // Lọc bill chỉ lấy những ngày đã trôi qua
      const pastBills = filterPastBills(allBills)
      setBills(pastBills)
      setLoading(false)
    } catch (error) {
      console.log("API Error:", error)
      toast.error("Failed to fetch booking history")
      setLoading(false)
    }
  }

  // Hàm để lọc những bill có ngày đã trôi qua
  const filterPastBills = (billsList) => {
    const currentDate = new Date()
    
    return billsList.filter(bill => {
      if (!bill.time_rental) return false
      
      // Parse date từ format "dd/MM/yyyy HH:mm:ss"
      const [datePart, timePart] = bill.time_rental.split(' ')
      const [day, month, year] = datePart.split('/')
      const [hours, minutes, seconds] = timePart.split(':')
      
      // JavaScript month is 0-based, so we subtract 1 from month
      const rentalDate = new Date(year, month - 1, day, hours, minutes, seconds)
      
      // Trả về true nếu ngày thuê đã trôi qua
      return rentalDate < currentDate
    })
  }

  useEffect(() => {
    if (isOpen) {
      getBills()
    }
  }, [isOpen, userId])

  const getStatusColor = (status) => {
    // Chuyển đổi status sang chữ in hoa để xử lý nhất quán
    const upperStatus = status?.toUpperCase() || "";
    
    switch (upperStatus) {
      case "SUCCESS":
        return {
          color: "success",
          icon: "eva:checkmark-circle-fill",
          displayText: "PAID" // Thay đổi hiển thị thành PAID
        }
      case "PENDING":
        return {
          color: "warning",
          icon: "eva:clock-fill",
          displayText: "PENDING"
        }
      case "CANCELLED":
      case "FAILED":
        return {
          color: "error",
          icon: "eva:close-circle-fill",
          displayText: upperStatus
        }
      default:
        return {
          color: "info",
          icon: "eva:info-fill",
          displayText: status
        }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const [day, month, year, time] = dateString.split(/[\/\s:]/)
    return `${day}/${month}/${year} ${time}:${dateString.split(":")[1]}:${dateString.split(":")[2]}`
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="booking-history-modal"
      aria-describedby="modal-showing-user-booking-history"
    >
      <Paper sx={modalStyle}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: "text",
              textFillColor: "transparent",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Booking History
          </Typography>
          <IconButton onClick={onClose} aria-label="close">
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 8,
            }}
          >
            <CircularProgress size={60} thickness={4} />
          </Box>
        ) : bills.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <Iconify icon="eva:calendar-outline" width={64} height={64} sx={{ color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No past booking history found
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {bills.map((bill) => {
              const statusConfig = getStatusColor(bill.status)
              
              return (
                <Grid item xs={12} md={6} key={bill._id}>
                  <Card
                    sx={{
                      mb: 3,
                      borderRadius: 2,
                      boxShadow: theme.shadows[3],
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: theme.shadows[6],
                      },
                      position: "relative",
                      overflow: "visible",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        zIndex: 9,
                      }}
                    >
                      <Label
                        color={statusConfig.color}
                        sx={{
                          borderRadius: "20px",
                          px: 2,
                          py: 0.5,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          boxShadow: theme.shadows[2],
                        }}
                      >
                        <Iconify icon={statusConfig.icon} sx={{ mr: 0.5, width: 16, height: 16 }} />
                        {statusConfig.displayText} {/* Sử dụng displayText thay vì status trực tiếp */}
                      </Label>
                    </Box>
                    
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Court
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                              {bill.court_id?.court_name || "N/A"}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Rental Price
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: "medium", color: theme.palette.success.main }}>
                              {bill.retal_price?.toLocaleString()} VND
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Rental Time
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                              {formatDate(bill.time_rental)}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Transaction Date
                            </Typography>
                            <Typography variant="body1">
                              {bill.transaction_bank_time || "N/A"}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="caption" color="text.secondary">
                          Order: {bill.order_code_pay_os}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(bill.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Paper>
    </Modal>
  )
}