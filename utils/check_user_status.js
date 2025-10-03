
function checkUserStatus(user) {
  if (!user) {
    return { allowed: false, message: "User not found" };
  }

  if (user.status === "blocked") {
    return { allowed: false, message: "Your account is blocked. Please contact support." };
  }

  if (user.status === "deleted") {
    return { allowed: false, message: "This account has been removed. Please contact support." };
  }

  return { allowed: true };
}

module.exports = checkUserStatus;