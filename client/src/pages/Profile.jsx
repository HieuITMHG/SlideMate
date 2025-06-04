
import { useSelector } from 'react-redux';

function Profile() {
    const user = useSelector((state) => state.user.userInfo);
    return (
        <div>
        <h1>Trang cá nhân</h1>
        <p>{user.name}</p>
        <p>{user.email}</p>
            <img src="https://drive.google.com/thumbnail?id=1NWlJXANXot2_414zB7fHlu_JH8f40zJd&sz=w1000" alt="ok" />
            
        </div>
    );
}

export default Profile;
