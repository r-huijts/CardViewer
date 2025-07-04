const { requireAuth } = require('../src/middleware/auth');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      session: {}
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res)
    };
    next = jest.fn();
  });

  test('should call next() when user is authenticated', () => {
    req.session.userId = 1;

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test('should return 401 when user is not authenticated', () => {
    // req.session.userId is undefined

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 when session is missing', () => {
    req.session = null;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });
});