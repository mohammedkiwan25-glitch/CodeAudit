export async function getCurrentUser(req, res) {
    res.status(200).json({
        user: {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            profileImage: req.user.profileImage,
            role: req.user.role,
        },
    })
}
