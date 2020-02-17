
var lmsENV = (function lmsENV()
{
    function getCurrentCourse()
    {
        return ENV['context_asset_string'].split('course_').pop();
    }

    function getCurrentUser()
    {
        return ENV['current_user_id'];
    }

    function getLang()
    {
        return ENV['LOCALE'];
    }

    function getCurrentRoles()
    {
        return ENV['current_user_roles'];
    }

    function getGroupCategories()
    {
        return ENV['group_categories'];
    }

    function isTeacher()
    {
        let result = false;
        let roles = getCurrentRoles();
        roles.forEach(function(role) {
            if (role == 'teacher') {
                result = true;
            }
        });

        return result;
    }

    return {
        getCurrentCourse: getCurrentCourse,
        getCurrentUser: getCurrentUser,
        getLang: getLang,
        getGroupCategories: getGroupCategories,
        isTeacher: isTeacher
    };
})();

