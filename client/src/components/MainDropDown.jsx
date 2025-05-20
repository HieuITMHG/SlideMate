import { useSelector } from "react-redux";


function MainDropDown() {
    const user = useSelector((state) => state.user.userInfo);
    return (
        <>
        <div>
            Avatar
        </div>

        <div>

        </div>
        </>
    );
}

export default MainDropDown;