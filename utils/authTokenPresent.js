import jwt_decode from 'jwt-decode';
import setAuthToken from './setAuthToken';
import storage from './storage';

const authTokenPresent = async () => {
    try {
        const ret = await storage.load({ key: 'jwtToken' });
		if (ret.token) {
			const decoded = jwt_decode(ret.token);
			if (Date.now() / 1000 < decoded.exp) {
				setAuthToken(ret.token);
				return decoded;
			}
		}
		return false;
    } catch (error) {
        return false;
    }
    
};

export default authTokenPresent;
