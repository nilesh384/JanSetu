import { Router } from "express";
import {
    createReport,
    getUserReports,
    getReportById,
    updateReport,
    resolveReport,
    deleteReport,
    getNearbyReports,
    getUserReportsStats,
    uploadReportMedia,
    uploadSingleMedia
} from '../controllers/reports.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// Media upload routes
router.route('/upload-media').post(
    upload.fields([
        { name: 'mediaFiles', maxCount: 10 },
        { name: 'audioFile', maxCount: 1 }
    ]), 
    uploadReportMedia
);
router.route('/upload-single-media').post(upload.single('mediaFile'), uploadSingleMedia);

// Report CRUD operations
router.route('/create').post(createReport);
router.route('/user/:userId').get(getUserReports);
router.route('/nearby').get(getNearbyReports);

router.route('/:reportId').get(getReportById);
router.route('/:reportId').put(updateReport);              //TODO: Restrict to report owner or admin
router.route('/:reportId').delete(deleteReport); 
router.route('/user/:userId/stats').get(getUserReportsStats);   

// Special operations
router.route('/:reportId/resolve').patch(resolveReport);   // TODO: Restrict to admin only

export default router;