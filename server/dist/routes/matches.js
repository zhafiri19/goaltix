"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const matchController_1 = require("../controllers/matchController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', matchController_1.MatchController.getAllMatches);
router.get('/upcoming', matchController_1.MatchController.getUpcomingMatches);
router.get('/:id', matchController_1.MatchController.getMatchById);
router.get('/:matchId/tickets', matchController_1.MatchController.getTicketsByMatch);
router.post('/', auth_1.authMiddleware, auth_1.adminMiddleware, matchController_1.MatchController.createMatch);
router.put('/:id', auth_1.authMiddleware, auth_1.adminMiddleware, matchController_1.MatchController.updateMatch);
router.delete('/:id', auth_1.authMiddleware, auth_1.adminMiddleware, matchController_1.MatchController.deleteMatch);
exports.default = router;
//# sourceMappingURL=matches.js.map