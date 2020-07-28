const container = document.getElementById('report-container');
var username = extractEmails(window.location.href);
function extractEmails (text)
{
    var mail = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)[0];
    return (mail.split('@')[0]);
};