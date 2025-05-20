
import { useSelector } from 'react-redux';

function Profile() {
    const user = useSelector((state) => state.user.userInfo);
    return (
        <div>
        <h1>Trang cá nhân</h1>
        <p>{user.name}</p>
        <p>{user.email}</p>
        </div>
    );
}

export default Profile;
