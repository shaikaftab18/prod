import { auth } from '../../lib/firebase';
import './detail.css';

const Detail = () => {          
    return (
        <div className='display'>
            <div className="user">
                <img src="./avatar.png" alt="User Avatar"/>
                <h3>aftab</h3>
            </div>
            <div className="info">
                <div className="option">
                    <div className="title">
                        <span>Chat Settings</span>
                        <img src="./arrowUp.png" alt="Arrow Up"/>  
                    </div>
                </div>
                <div className="option">
                    <div className="title">
                        <span>Privacy & help</span>
                        <img src="./arrowUp.png" alt="Arrow Up"/>  
                    </div>
                </div>
                <div className="option">
                    <div className="title">
                        <span>Shared Photos</span>
                        <img src="./arrowDown.png" alt="Arrow Down"/>  
                    </div>
                    <div className="photos">
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="./avatar.png" alt="Shared Photo"/>
                                <span>sjurbvjsbv</span>
                            </div>
                                <img src="./download.png" alt="Download Icon" className='icon'/>
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="./avatar.png" alt="Shared Photo"/>
                                <span>sjurbvjsbv</span>
                            </div>
                                <img src="./download.png" alt="Download Icon"className='icon'/>
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="./avatar.png" alt="Shared Photo"/>
                                <span>sjurbvjsbv</span>
                            </div>
                                <img src="./download.png" alt="Download Icon" className='icon'/>
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="./avatar.png" alt="Shared Photo"/>
                                <span>sjurbvjsbv</span>
                            </div>
                                <img src="./download.png" alt="Download Icon" className='icon'/>
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="./avatar.png" alt="Shared Photo"/>
                                <span>sjurbvjsbv</span>
                            </div>
                                <img src="./download.png" alt="Download Icon" className='icon'/>
                        </div>
                    </div>
                </div>
                <div className="option">
                    <div className="title">
                        <span>Shared Files</span>
                        <img src="./arrowUp.png" alt="Arrow Up"/>  
                    </div>
                </div>
                <button>Block User</button>
                <button className='logout' onClick={()=>auth.signOut()}>Logout</button>
            </div>
        </div>
    );
}

export default Detail;