const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'password123',
    name: 'Admin User',
    role: 'ADMIN'
  }
];

export const mockAuthApi = {
  login: (email, password) => {
    return new Promise((resolve, reject) => {
      const user = mockUsers.find(u => u.email === email);
      
      if (user && user.password === password) {
        const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
        
        resolve({
          data: {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role
            },
            token
          }
        });
      } else {
        reject({
          response: {
            data: {
              message: 'Invalid email or password'
            }
          }
        });
      }
    });
  },
  
  register: (email, password, name) => {
    return new Promise((resolve, reject) => {
      const existingUser = mockUsers.find(u => u.email === email);
      
      if (existingUser) {
        reject({
          response: {
            data: {
              message: 'User already exists'
            }
          }
        });
        return;
      }
      
      const newUser = {
        id: (mockUsers.length + 1).toString(),
        email,
        password,
        name: name || email.split('@')[0],
        role: 'CUSTOMER'
      };
      
      mockUsers.push(newUser);
      
      const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
      
      resolve({
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role
          },
          token
        }
      });
    });
  },
  
  getCurrentUser: () => {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        reject({
          response: {
            data: {
              message: 'Not authenticated'
            }
          }
        });
        return;
      }
      
      resolve({
        data: {
          user: {
            id: '1',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'ADMIN'
          }
        }
      });
    });
  }
};
