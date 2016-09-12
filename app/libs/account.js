import ax from 'utils/ax';
import fbase from 'stores/fbase';
import toastr from 'toastr';

export default {
  updateUsername(name) { //returns promise
    fbase.getToken().then((token) => {
      console.log('here', token);
      ax.post('/user/name', {token, name}, {timeout: 1000}).then((resp) => {
        console.log('herehere');
        if (resp.data.success === true) {
          toastr.success("Username updated successfully!");
        } else if (resp.data.error === 'USERNAME_TAKEN') {
          toastr.error("That username is already taken! Please try again.");
        } else {
          toastr.error("")
        }
      }).catch((error) => {
        console.log(error);
        toastr.error("Request failed.");
      });
    });
  }
}
