/* ==========================================================================
   UI Helper & Auth Tab Switcher
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Simple Auth Tab Switcher on login.html
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');

  if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
    });
  }
});
