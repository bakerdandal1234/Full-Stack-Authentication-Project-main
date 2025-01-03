
import { useAuth } from '../context/AuthContext';

const About = () => {
  const auth = useAuth();
  console.log(auth);

  return (
    <div>
    
      {auth.isAuthenticated ? (
        <div>
          <h1>{auth.user.username}</h1>
          <p>Email: {auth.user.email}</p>
          <p>Phone: {auth.user.phone || 'Not provided'}</p> {/* إضافة رقم الهاتف */}
          <p>Created At: {auth.user.createdAt} </p>
          <h2>About User</h2>
          <p>{auth.user.bio || 'No bio available.'}</p> {/* سيرة ذاتية أو معلومات إضافية */}
          {/* عرض المزيد من البيانات حسب الحاجة */}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default About;