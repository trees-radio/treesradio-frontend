

export default class Avatars {
  constructor(username) {
    this.defaultAvatarUrl = `//tr-avatars.herokuapp.com/avatars/50/${username}.png`;
  }

  get avatar() {
    return this.defaultAvatarUrl;
  }
}
