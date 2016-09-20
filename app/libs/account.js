import ax from 'utils/ax';
import profile from 'stores/profile';
import toast from 'utils/toast';

export default {
  updateUsername(name) { //returns promise
    profile.getToken().then((token) => {
      // console.log('here', token);
      ax.post('/user/name', {token, name}, {timeout: 1000}).then((resp) => {
        // console.log('herehere');
        if (resp.data.success === true) {
          toast.success("Username updated successfully!");
        } else if (resp.data.error === 'USERNAME_TAKEN') {
          toast.error("That username is already taken! Please try again.");
        } else {
          toast.error("")
        }
      }).catch((error) => {
        // console.log(error);
        toast.error("Server request failed.");
      });
    });
  }
}
