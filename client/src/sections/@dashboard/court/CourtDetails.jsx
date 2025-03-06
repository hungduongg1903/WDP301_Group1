import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, Typography, Box, Button, CircularProgress, Grid, Avatar, 
  TextField, Breadcrumbs, Link, IconButton, Dialog, DialogActions, 
  DialogContent, DialogContentText, DialogTitle 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import shuffle from 'lodash.shuffle';
import { apiUrl, routes, methods } from '../../../constants';
import Label from '../../../components/label';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import { useAuthStore } from '../../../store/authStore';
// Import icons for edit and delete actions
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const TruncatedTypography = styled(Typography)({
  color: 'black',
});

const CourtDetails = () => {
  const { user } = useAuthStore();
  
  const { id } = useParams();
  const navigate = useNavigate();
  const [court, setCourt] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedCourts, setRelatedCourts] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [isBorrowalModalOpen, setIsBorrowalModalOpen] = useState(false);
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [review, setReview] = useState('');
  
  // State for edit functionality
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingReviewContent, setEditingReviewContent] = useState('');
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState(null);

  const getCourt = useCallback(() => {
    setIsLoading(true);
    axios
      .get(apiUrl(routes.COURT, methods.GET, id), { withCredentials: true })
      .then((response) => {
        const courtData = response.data.court;
        setCourt(courtData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching court details:', error);
        setIsLoading(false);
      });
  }, [id]);

  useEffect(() => {
    getCourt();
  }, [getCourt]);

  const getFeedbacks = useCallback(() => {
    setIsLoading(true);
    axios
      .get(apiUrl(routes.FEEDBACK, methods.GET_BY_COURT_ID, id), { withCredentials: true })
      .then((response) => {
        console.log('Fetched reviews:', response.data);
        // Map userId from user._id if not present
        const reviewsWithUserIds = response.data.map(review => {
          if (!review.userId && review.user && review.user._id) {
            return { ...review, userId: review.user._id };
          }
          return review;
        });
        setReviews(reviewsWithUserIds);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching feedbacks:', error);
        setIsLoading(false);
      });
  }, [id]);
  
  useEffect(() => {
    getFeedbacks();
  }, [getFeedbacks]);
 
  const addReview = useCallback(() => {
    if (!review.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }
    
    const reviewData = {
      court: id,
      user: user?._id,
      review,
      reviewedAt: new Date(),
    };
    axios
      .post(apiUrl(routes.FEEDBACK, methods.POST, id), reviewData)
      .then((response) => {
        // Ensure we have the correct structure with userId
        const newReview = {
          feedback_id: response.data.review._id,
          content: response.data.review.content,
          userName: user?.name,
          userId: user?._id,
        };
        setReview('');
        setReviews([...reviews, newReview]);
        toast.success('Đã thêm đánh giá thành công');
      })
      .catch((error) => {
        console.error('Error adding review:', error);
        toast.error('Không thể thêm đánh giá');
      });
  }, [id, review, reviews, user]);

  // Handle edit review
  const handleEditReview = (reviewId, currentContent) => {
    setIsEditing(true);
    setEditingReviewId(reviewId);
    setEditingReviewContent(currentContent);
  };

  // Submit edited review
  const submitEditedReview = () => {
    if (!editingReviewContent.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }

    // Log the API URL for debugging
    const updateUrl = apiUrl(routes.FEEDBACK, methods.PUT, editingReviewId);
    console.log('Update API URL:', updateUrl);

    // Prepare the data to update
    const updateData = { 
      content: editingReviewContent
    };
    
    // Make the API request
    axios
      .put(updateUrl, updateData, { withCredentials: true })
      .then((response) => {
        console.log('Update response:', response.data);
        
        // Update the reviews state with the edited content
        const updatedReviews = reviews.map(review => 
          review.feedback_id === editingReviewId 
            ? { ...review, content: editingReviewContent } 
            : review
        );
        setReviews(updatedReviews);
        
        // Reset edit state
        setIsEditing(false);
        setEditingReviewId(null);
        setEditingReviewContent('');
        
        toast.success('Đã cập nhật đánh giá thành công');
      })
      .catch((error) => {
        console.error('Error updating review:', error);
        
        // Provide more specific error messages based on the error
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          
          if (error.response.status === 404) {
            toast.error('Không tìm thấy đường dẫn API cập nhật (404)');
          } else {
            toast.error(`Lỗi từ server: ${error.response.status}`);
          }
        } else if (error.request) {
          toast.error('Không nhận được phản hồi từ server');
        } else {
          toast.error('Lỗi khi gửi yêu cầu: ' + error.message);
        }
      });
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setEditingReviewId(null);
    setEditingReviewContent('');
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (reviewId) => {
    setDeleteReviewId(reviewId);
    setDeleteDialogOpen(true);
  };

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteReviewId(null);
  };

  // Delete review
  const deleteReview = () => {
    const deleteUrl = apiUrl(routes.FEEDBACK, methods.DELETE, deleteReviewId);
    console.log('Delete API URL:', deleteUrl);
    
    axios
      .delete(deleteUrl, { withCredentials: true })
      .then((response) => {
        console.log('Delete response:', response);
        
        // Remove the deleted review from state
        const filteredReviews = reviews.filter(review => review.feedback_id !== deleteReviewId);
        setReviews(filteredReviews);
        
        closeDeleteDialog();
        toast.success('Đã xóa đánh giá thành công');
      })
      .catch((error) => {
        console.error('Error deleting review:', error);
        
        // Provide more specific error messages
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          
          if (error.response.status === 404) {
            toast.error('Không tìm thấy đường dẫn API xóa (404)');
          } else {
            toast.error(`Lỗi từ server: ${error.response.status}`);
          }
        } else if (error.request) {
          toast.error('Không nhận được phản hồi từ server');
        } else {
          toast.error('Lỗi khi gửi yêu cầu: ' + error.message);
        }
        
        closeDeleteDialog();
      });
  };

  if (isLoading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  if (!court) {
    return (
      <Container>
        <Typography variant="h5">Court not found</Typography>
      </Container>
    );
  }

  const images = [
    {
      original: court.court_photo,
      thumbnail: court.court_photo,
    },
    {
      original: court.court_photo,
      thumbnail: court.court_photo,
    },
  ];

  const backToCourtPage = () => {
    navigate('/courts');
  };

  const handleOpenBorrowalModal = () => {
    setIsBorrowalModalOpen(true);
  };

  const handleCloseBorrowalModal = () => {
    setIsBorrowalModalOpen(false);
  };

  // Check if a review belongs to the current user
  const isUserReview = (reviewUserId) => {
    return user && user._id === reviewUserId;
  };
  
  // Debug function to check review data
  const debugReview = (review) => {
    console.log('Review data:', {
      id: review.feedback_id,
      content: review.content,
      userName: review.userName,
      userId: review.userId
    });
    console.log('Current user ID:', user?._id);
    console.log('Can edit?', review.userId === user?._id);
  };

  return (
    <Container>
      <Helmet>
        <title>{court.court_name} - Court Details</title>
      </Helmet>

      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/courts">
          Courts
        </Link>
        <Typography color="text.primary">{court.court_name}</Typography>
      </Breadcrumbs>

      <Button variant="outlined" color="primary" onClick={backToCourtPage} sx={{ mb: 2 }}>
        Back to Courts
      </Button>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <ImageGallery items={images} />
        </Grid>
        <Grid item xs={12} sm={8} style={{ paddingLeft: '3rem' }}>
          <Box>
            <Typography variant="h3">{court.court_name}</Typography>
            
            <Typography variant="subtitle1" sx={{ color: '#888888', mt: 2 }}>
              {court.court_name}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#888888', mt: 2 }}>
              Giá thuê sân: {court.price} 000 VND/Giờ
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#888888', mt: 2 }}>Mở cửa: 6:00 sáng - 10:00 tối</Typography>
            <Typography variant="subtitle1" sx={{ color: '#888888', mt: 2 }}>Tiện nghi: Cho thuê vợt và bóng, Nhà vệ sinh tại chỗ, Đài phun nước, Khu vực ngồi có mái che</Typography>
            <Typography variant="subtitle1" sx={{ color: '#888888', mt: 2 }}>An toàn: Sân được bảo trì thường xuyên để đảm bảo an toàn cho người chơi</Typography>

            <Link component={RouterLink} to={`/courts/schedule/${court._id}?courtName=${encodeURIComponent(court.court_name)}`}>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Đặt sân ngay
              </Button>
            </Link>
          </Box>
        </Grid>
      </Grid>
      
      <Grid container spacing={2} sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Write a Review
        </Typography>
        <Grid item xs={12} style={{ paddingLeft: '3rem' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar alt={user?.name} src={user?.photoUrl} sx={{ mr: 2 }} />
            <Typography variant="subtitle1" sx={{ color: '#888888' }}>
              {user?.name}
            </Typography>
          </Box>
          <TextField
            id="standard-basic"
            label="Your comment"
            variant="standard"
            fullWidth
            rows={4}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={addReview}>
            Submit Review
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2 }}>
            Feedbacks
          </Typography>
          {reviews.map((review) => (
            <Box key={review.feedback_id} sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar alt={review.userName} sx={{ mr: 2 }} />
                  <Typography variant="subtitle1" sx={{ color: '#888888' }}>
                    {review.userName}
                  </Typography>
                </Box>
                
                {user && user._id === review.userId && (
                  <Box>
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => {
                        console.log('Editing review:', review.feedback_id);
                        handleEditReview(review.feedback_id, review.content);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => {
                        console.log('Attempting to delete review:', review.feedback_id);
                        openDeleteDialog(review.feedback_id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
              
              {isEditing && editingReviewId === review.feedback_id ? (
                <Box sx={{ mt: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={editingReviewContent}
                    onChange={(e) => setEditingReviewContent(e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button size="small" onClick={cancelEditing} sx={{ mr: 1 }}>
                      Hủy
                    </Button>
                    <Button size="small" variant="contained" color="primary" onClick={submitEditedReview}>
                      Lưu
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {review.content}
                </Typography>
              )}
            </Box>
          ))}
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Xác nhận xóa đánh giá"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Hủy</Button>
          <Button onClick={deleteReview} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourtDetails;