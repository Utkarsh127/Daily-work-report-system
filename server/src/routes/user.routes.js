const express = require('express');
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createUserValidators,
  updateUserValidators,
  updateProfileValidators,
  listUsersValidators,
} = require('../validators/user.validators');

const router = express.Router();

// All user routes require authentication
router.use(protect);

// ── Own profile (any authenticated user) ─────────────────

/**
 * @openapi
 * /api/users/me/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get own profile
 *     responses:
 *       200:
 *         description: Profile data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/UserPublic'
 */
router.get('/me/profile', userController.getMyProfile);

/**
 * @openapi
 * /api/users/me/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update own profile (name, avatar)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Smith
 *               avatar:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/avatar.jpg
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/me/profile', updateProfileValidators, validate, userController.updateMyProfile);

// ── Manager-only CRUD ─────────────────────────────────────

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List all employees (Manager only)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [employee, manager] }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name, email, or employeeId
 *     responses:
 *       200:
 *         description: Paginated user list
 */
router.get('/', authorize('manager'), listUsersValidators, validate, userController.listUsers);

/**
 * @openapi
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new employee (Manager only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alice Johnson
 *               email:
 *                 type: string
 *                 format: email
 *                 example: alice@company.com
 *               password:
 *                 type: string
 *                 example: Temp@1234
 *               department:
 *                 type: string
 *                 description: Department ObjectId
 *     responses:
 *       201:
 *         description: Employee created
 *       409:
 *         description: Email already exists
 */
router.post('/', authorize('manager'), createUserValidators, validate, userController.createUser);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get employee by ID (Manager only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User data
 *       404:
 *         description: User not found
 */
router.get('/:id', authorize('manager'), userController.getUserById);

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update an employee (Manager only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               department: { type: string }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: User updated
 */
router.put('/:id', authorize('manager'), updateUserValidators, validate, userController.updateUser);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Deactivate an employee (Manager only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deactivated
 *       400:
 *         description: Cannot deactivate own account
 */
router.delete('/:id', authorize('manager'), userController.deactivateUser);

module.exports = router;
