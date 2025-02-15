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
import BorrowalForm from '../borrowal/BorrowalForm';
import BorrowalFormForUser from '../borrowal/BorowalFormForUser';
import { useAuth } from '../../../hooks/useAuth';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

const TruncatedTypography = styled(Typography)({
  color: 'black',
});

const CourtDetails = () => {
  const { user } = useAuth();
  const [borrowal, setBorrowal] = useState({
    bookId: '',
    memberId: '',
    borrowedDate: '',
    dueDate: '',
    status: '',
  });
  
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setCourt] = useState(null);
  const [author, setAuthor] = useState(null);
  const [genre, setGenre] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedCourts, setRelatedCourts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBorrowalModalOpen, setIsBorrowalModalOpen] = useState(false);
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [review, setReview] = useState('');
  const getCourt = useCallback(() => {
    setIsLoading(true);
    axios
      .get(apiUrl(routes.BOOK, methods.GET, id), { withCredentials: true })
      .then((response) => {
        const bookData = response.data.book;
        setCourt(bookData);
        return Promise.all([
          axios.get(apiUrl(routes.AUTHOR, methods.GET, bookData.authorId), { withCredentials: true }),
          axios.get(apiUrl(routes.GENRE, methods.GET, bookData.genreId), { withCredentials: true }),
        ]);
      })
      .then(([authorResponse, genreResponse]) => {
        setAuthor(authorResponse.data.author);
        setGenre(genreResponse.data.genre);
        // Fetch related books
        return axios.get(apiUrl(routes.BOOKS_BY_GENRE, methods.GET, genreResponse.data.genre._id), {
          withCredentials: true,
        });
      })
      .then((relatedCourtsResponse) => {
        const relatedCourts = relatedCourtsResponse.data.books.filter((b) => b._id !== id);
        const shuffledCourts = shuffle(relatedCourts).slice(0, 5);
        setRelatedCourts(shuffledCourts);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching book details:', error);
        toast.error('Failed to fetch book details');
        setIsLoading(false);
      });
  }, [id]);

  useEffect(() => {
    getCourt();
  }, [getCourt]);

  const addBorrowal = () => {
    axios
      .post(apiUrl(routes.BORROWAL, methods.POST), borrowal)
      .then((response) => {
        toast.success('Borrowal added successfully');
        handleCloseBorrowalModal();
        clearBorrowForm();
      })
      .catch((error) => {
        console.error('Error adding borrowal:', error);
        toast.error('Failed to add borrowal');
      });
  };

  const addReview = () => {
    const reviewData = {
      book: id,
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

  if (!book || !author || !genre) {
    return (
      <Container>
        <Typography variant="h5">Court not found</Typography>
      </Container>
    );
  }

  const images = [
    {
      original: book.photoUrl,
      thumbnail: book.photoUrl,
    },
    ...book.pageUrls.map((url) => ({
      original: url,
      thumbnail: url,
    })),
  ];

  const backToCourtPage = () => {
    navigate('/books');
  };

  const handleOpenBorrowalModal = () => {
    setIsBorrowalModalOpen(true);
  };

  const handleCloseBorrowalModal = () => {
    setIsBorrowalModalOpen(false);
  };

  const clearBorrowForm = () => {
    setBorrowal({
      bookId: '',
      memberId: '',
      borrowedDate: '',
      dueDate: '',
      status: '',
    });
  };

  return (
    <Container>
      <Helmet>
        <title>{book.name} - Court Details</title>
      </Helmet>

      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/books">
          Courts
        </Link>
        <Link component={RouterLink} to={`/genre/${genre._id}`}>
          {genre.name}
        </Link>
        <Typography color="text.primary">{book.name}</Typography>
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
            <Typography variant="h3">{book.name}</Typography>
            <Label color={book.isAvailable ? 'success' : 'error'} sx={{ mt: 1, mb: 2 }}>
              {book.isAvailable ? 'Available' : 'Not available'}
            </Label>
            <Typography
              variant="subtitle1"
              sx={{ color: '#888888', mt: 2, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => navigate(`/author/${author._id}`)}
            >
              <Avatar alt={author.name} src={author.photoUrl} /> {author.name}
            </Typography>
            <Box sx={{ position: 'relative', mt: 2 }}>
              <TruncatedTypography variant="body1">{book.summary}</TruncatedTypography>
            </Box>
            <Typography variant="subtitle1" sx={{ color: '#888888', mt: 2 }}>
              ISBN: {book.isbn}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#888888', mt: 2 }}>
              GENRE: {genre.name}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#888888', mt: 2 }}>
              LANGUAGE: English
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#888888', mt: 2 }}>
              PAGES: 240p
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={(e) => {
                setSelectedCourtId(book._id);
                handleOpenBorrowalModal(e);
              }}
            >
              Borrow
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
          {relatedCourts.map((relatedCourt) => (
            <Grid item xs={12} sm={2} key={relatedCourt._id} style={{ paddingLeft: '3rem' }}>
              <Card>
                <Box sx={{ position: 'relative' }}>
                  <img alt={relatedCourt.name} src={relatedCourt.photoUrl} style={{ width: '100%', height: 'auto' }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ mt: 2, textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => navigate(`/books/${relatedCourt._id}`)}
                  >
                    {relatedCourt.name}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {user && (user.isAdmin || user.isLibrarian) ? (
          <BorrowalForm
          isModalOpen={isBorrowalModalOpen}
          handleCloseModal={handleCloseBorrowalModal}
          id={selectedCourtId}
          borrowal={borrowal}
          setBorrowal={setBorrowal}
          handleAddBorrowal={addBorrowal}
          bookName = {book.name}
          />
        ) : (
          <BorrowalFormForUser
          isModalOpen={isBorrowalModalOpen}
          handleCloseModal={handleCloseBorrowalModal}
          id={selectedCourtId}
          borrowal={borrowal}
          setBorrowal={setBorrowal}
          handleAddBorrowal={addBorrowal}
          bookName = {book.name}
          />
        )}
      </Container>
    );
  };

  export default CourtDetails;

