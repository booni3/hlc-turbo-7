window.notifyForm = function (customerEmail) {
  return {
    variantId: null,
    email: customerEmail,
    error: '',
    success: false,
    loading: false,
    init() {
      this.supportsSessionStorage() && (this.email = sessionStorage.getItem("HlcNotifyEmail"))
    },
    submit: function () {
      this.clearErrors();
      this.email && this.isValidEmail() ? this.post() : this.error = "Please provide a valid email"
    },
    clearErrors: function () {
      this.error = ""
    },
    isValidEmail: function () {
      return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(String(this.email).toLowerCase())
    },
    post: function () {
      this.loading = false
      fetch("/apps/stock-info/notify?" + new URLSearchParams({
        email: this.email,
        variant: this.variantId
      }))
          .then(t => t.json())
          .then(t => {
            this.success = true;
            this.supportsSessionStorage() && sessionStorage.setItem("HlcNotifyEmail", this.email)
          }).catch(() => {
            this.error = "Oops, something went wrong."
          }).finally(() => {
            this.loading = false;
          })
    },
    supportsSessionStorage() {
      try {
        return "sessionStorage" in window && null !== window.sessionStorage
      } catch (t) {
        return false
      }
    }
  }
}