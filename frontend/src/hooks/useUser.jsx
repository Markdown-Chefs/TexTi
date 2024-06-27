import { useState, useEffect } from 'react';

function useUser() {
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            if (userInfo.username) {
                setUsername(userInfo.username);
            }
            if (userInfo.userId) {
                setUserId(userInfo.userId);
            }
        }
    }, []);

    return { username, userId };
}

export default useUser;