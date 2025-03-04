const db = require('../models');
const Feedback = db.Feedback;

async function getReviewById(req, res,next) {
  try {
        const reviewid = req.params.id
        const review = await Feedback.findById(reviewid).populate("court", "court_name").populate("user","name");
        res.status(200).json({review : review})
  } catch (error) {
      next(error)
  }
}

async function getReviewByCourtId(req, res, next) {
    try {
        const courtId = req.params.bid
        const listReview = []
        console.log(courtId);
        const reviews = await Feedback.find().populate("court", "court_name").populate("user","name");
        const review = reviews.map(r => {
            if (r.court._id == courtId)
              listReview.push(r)
        })
        const listfromd = listReview.map(r => {
            return {
                
                content: r.content,
                user: r.user.name,
                court: r.court_name
            }
        })
        res.status(200).json(listfromd)
     
    } catch (error) {
        console.error("Error fetching reviews:", error);
        next(error); 
    }
}



async function getAllReviews (req, res,next) {
    try {
        const reviews = await Feedback.find().populate("court", "court_name").populate("user","name");
        res.status(200).send(reviews)
    } catch (error) {
        next(error)
    }
}

async function addReview (req, res,next) {
    try {       
        const courtId = req.params.id
        const userId = req.body.user
        if (!userId) return res.status(401).send('Unauthorized');
        const existingReview = await Feedback.findOne({ user: userId, court: req.params.id });
        console.log(existingReview);
        if (existingReview) return res.status(400).send({ message: 'User already submitted a feedback for this court' });
        
        const newReview = new Feedback({
            user: req.body.user,
            court: courtId,
            content: req.body.content
        });
        await Feedback.create(newReview);
        res.status(201).send({message: 'Feedback created successfully'});
    } catch (error) {
        next(error)
    }
}

async function updateReview (req, res,next){
try {
    const reviewId = req.params.id
    const updatedReview = req.body
    const newReview = await Feedback.findByIdAndUpdate(reviewId,updatedReview)
    res.status(200).send(await Feedback.findById(newReview.id))
} catch (error) {
    next(error)
}
}

async function deleteReview(req, res, next){
  try {
    const reviewId = req.params.id
    const deleteR = await Feedback.findByIdAndDelete(reviewId)
   res.status(204).send({message : "Review deleted successfully"})
  } catch (error) {
    next(error)
  }
}

const reviewController = {
    getReviewById,
    getAllReviews,
    addReview,
    updateReview,
    deleteReview,
    getReviewByCourtId
}
module.exports = reviewController;