
import { useSelector } from 'react-redux';

function Profile() {
  const user = useSelector((state) => state.user.userInfo);

  return (
    <div>
   
    <div style={{
      height: "90vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f5f5f5"
    }}>
      <div style={{
        width: "400px",
        height: "400px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        textAlign: "center"
      }}>
        <h1 style={{ alignSelf: "flex-start", marginTop: "-100px",fontWeight: "bold", color: "black",  alignSelf: "center",fontSize: "25px"  }}>Thông tin cá nhân</h1>
        <img 
        src="https://drive.google.com/thumbnail?id=1NWlJXANXot2_414zB7fHlu_JH8f40zJd&sz=w1000"
         alt="ok"
        style={{ width: "100px", height: "100px", borderRadius: "50%" ,marginTop:"20px",marginBottom:"20px"}}
        />
        
        <p> <span style={{ color: "blue", fontWeight: "bold" }}>Tên người dùng:</span> {user.name}</p>
        <p><span style={{ color: "blue" , fontWeight: "bold"}}>Email:</span>{user.email}</p>
        <p><span style={{ color: "blue" , fontWeight: "bold"}}>Số điện thoại:</span>{user.phone}</p>
        <p
        style={{
            alignSelf: "flex-start",
            marginLeft: "20px",
            marginTop: "20px",
        }}
        >
        <span style={{ color: "blue", fontWeight: "bold" }}>Tag yêu thích:</span>
        </p>
      </div>
      
    </div>
    </div>
  );
}

export default Profile;
