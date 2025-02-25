import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Box, Button, CircularProgress, Grid, Avatar, TextField, Card, Breadcrumbs, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import shuffle from 'lodash.shuffle';
import { apiUrl, routes, methods } from '../../../constants';
import Label from '../../../components/label';
import { useAuth } from '../../../hooks/useAuth';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

const TruncatedTypography = styled(Typography)({
  color: 'black',
});

const CourtDetails = () => {
  const { user } = useAuth();
  
  const { id } = useParams();
  const navigate = useNavigate();
  const [court, setCourt] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedCourts, setRelatedCourts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBorrowalModalOpen, setIsBorrowalModalOpen] = useState(false);
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [review, setReview] = useState('');
  const getCourt = useCallback(() => {
    setIsLoading(true);
    axios
      .get(apiUrl(routes.COURT, methods.GET, id), { withCredentials: true })
      .then((response) => {
        const courtData = response.data.court;
        console.log(response.data)
        setCourt(courtData);
        return Promise.all([
          // axios.get(apiUrl(routes.AUTHOR, methods.GET, courtData.authorId), { withCredentials: true }),
          // axios.get(apiUrl(routes.GENRE, methods.GET, courtData.genreId), { withCredentials: true }),
        ]);
      })
      .then((relatedCourtsResponse) => {
        console.log(relatedCourtsResponse.data)
        const relatedCourts = relatedCourtsResponse.data.court.filter((b) => b._id !== id);
        const shuffledCourts = shuffle(relatedCourts).slice(0, 5);
        setRelatedCourts(shuffledCourts);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching court details:', error);
        // toast.error('Failed to fetch court details');
        setIsLoading(false);
      });
  }, [id]);

  useEffect(() => {
    getCourt();
  }, [getCourt]);


  const addReview = () => {
    const reviewData = {
      court: id,
      reviewedBy: user?._id,
      review,
      reviewedAt: new Date(),
    };
    console.log(reviewData);
    axios
      .post(apiUrl(routes.REVIEW, methods.POST,id), reviewData)
      .then((response) => {
        toast.success('Review added successfully');
        setReview('');
        setReviews([...reviews, response.data.review]);
      })
      .catch((error) => {
        console.error('Error adding review:', error);
        toast.error('Failed to add review');
      });
  };
  console.log(user?._id);

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
    // ...court.pageUrls.map((url) => ({
    //   original: url,
    //   thumbnail: url,
    // })),
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
        {/* <Link component={RouterLink} to={`/genre/${genre._id}`}>
          {genre.name}
        </Link> */}
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
            {/* <Label color={court.isAvailable ? 'success' : 'error'} sx={{ mt: 1, mb: 2 }}>
              {court.isAvailable ? 'Available' : 'Not available'}
            </Label> */}
          
            
            <Typography variant="subtitle1" sx={{ color: '#888888', mt: 2 }}>
              {court.court_name}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#888888', mt: 2 }}>
              Giá thuê sân: {court.price} 000 VND/Giờ
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#888888', mt: 2 }}>Mở cửa: 6:00 sáng - 10:00 tối</Typography>
            <Typography variant="subtitle1" sx={{ color: '#888888', mt: 2 }}>Tiện nghi: Cho thuê vợt và bóng, Nhà vệ sinh tại chỗ, Đài phun nước, Khu vực ngồi có mái che</Typography>
            <Typography variant="subtitle1" sx={{ color: '#888888', mt: 2 }}>An toàn: Sân được bảo trì thường xuyên để đảm bảo an toàn cho người chơi</Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              // onClick={(e) => {
              //   setSelectedCourtId(court._id);
              //   handleOpenBorrowalModal(e);
              // }}
            >
              Đặt sân ngay
            </Button>
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
          <Typography variant="h6" sx={{ mt: 2 }}>
            Related Courts
          </Typography>
          {/* {relatedCourts.map((relatedCourt) => (
            <Grid item xs={12} sm={2} key={relatedCourt._id} style={{ paddingLeft: '3rem' }}>
              <Card>
                <Box sx={{ position: 'relative' }}>
                  <img alt={relatedCourt.name} src={relatedCourt.photoUrl} style={{ width: '100%', height: 'auto' }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ mt: 2, textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => navigate(/courts/${relatedCourt._id})}
                  >
                    {relatedCourt.name}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))} */}
        </Grid>

        {/* {user && (user.isAdmin || user.isLibrarian) ? (
          <BorrowalForm
          isModalOpen={isBorrowalModalOpen}
          handleCloseModal={handleCloseBorrowalModal}
          id={selectedCourtId}
          borrowal={borrowal}
          setBorrowal={setBorrowal}
          handleAddBorrowal={addBorrowal}
          courtName = {court.name}
          />
        ) : (
          <BorrowalFormForUser
          isModalOpen={isBorrowalModalOpen}
          handleCloseModal={handleCloseBorrowalModal}
          id={selectedCourtId}
          borrowal={borrowal}
          setBorrowal={setBorrowal}
          handleAddBorrowal={addBorrowal}
          courtName = {court.name}
          />
        )} */}
      </Container>
    );
  };

  export default CourtDetails;