# ReWear Deployment Guide

## Frontend Proxy Configuration

### Development (Current Setup)
- Uses proxy in `package.json`: `"proxy": "http://localhost:5000"`
- API calls go to `localhost:5000` automatically

### Production Deployment

#### 1. Environment Variables
Create a `.env` file in the `client` directory:

```env
# Replace with your actual backend URL
REACT_APP_API_URL=https://your-backend-domain.com
```

#### 2. Backend URL Examples
- **Render**: `https://your-app-name.onrender.com`
- **Heroku**: `https://your-app-name.herokuapp.com`
- **Railway**: `https://your-app-name.railway.app`
- **Vercel**: `https://your-backend.vercel.app`
- **Netlify**: `https://your-backend.netlify.app`

#### 3. Updated Configuration
The frontend now uses a centralized axios configuration (`client/src/config/axios.js`) that:
- Uses proxy in development
- Uses `REACT_APP_API_URL` in production
- Automatically handles authentication headers
- Includes error handling for 401 responses

### Deployment Steps

#### Frontend (React)
1. **Build the project**:
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to your platform**:
   - **Vercel**: Connect GitHub repo, set environment variables
   - **Netlify**: Drag `build` folder or connect GitHub repo
   - **Firebase**: Use Firebase CLI
   - **AWS S3**: Upload `build` folder

3. **Set environment variables** in your hosting platform:
   - `REACT_APP_API_URL`: Your backend URL

#### Backend (Node.js)
1. **Deploy your backend** to your chosen platform
2. **Set environment variables**:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret
   - `ADMIN_APPROVAL_CODE`: Admin registration code (optional)

### Important Notes

1. **CORS Configuration**: Ensure your backend allows requests from your frontend domain
2. **Environment Variables**: All React environment variables must start with `REACT_APP_`
3. **Build Process**: The build process will replace environment variables at build time
4. **HTTPS**: Use HTTPS URLs for production API calls

### Testing Deployment

1. **Test API connectivity**:
   - Check browser network tab for API calls
   - Verify authentication works
   - Test file uploads if applicable

2. **Common Issues**:
   - CORS errors: Check backend CORS configuration
   - 404 errors: Verify API URL is correct
   - Authentication issues: Check JWT token handling

### Platform-Specific Notes

#### Vercel
- Automatically detects React apps
- Set environment variables in project settings
- Supports serverless functions for backend

#### Netlify
- Upload `build` folder or connect GitHub
- Set environment variables in site settings
- May need redirect rules for React Router

#### Render
- Good for both frontend and backend
- Automatic deployments from GitHub
- Free tier available

### Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Keep sensitive data in environment variables
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Configure CORS properly for your domain 