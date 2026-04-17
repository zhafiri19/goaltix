"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.use(auth_1.adminMiddleware);
router.get('/dashboard', adminController_1.AdminController.getDashboard);
router.get('/users', adminController_1.AdminController.getAllUsers);
router.patch('/users/:id/status', adminController_1.AdminController.updateUserStatus);
router.delete('/users/:id', adminController_1.AdminController.deleteUser);
router.get('/stadiums', adminController_1.AdminController.getAllStadiums);
router.post('/stadiums', adminController_1.AdminController.createStadium);
router.put('/stadiums/:id', adminController_1.AdminController.updateStadium);
router.delete('/stadiums/:id', adminController_1.AdminController.deleteStadium);
exports.default = router;
//# sourceMappingURL=admin.js.map