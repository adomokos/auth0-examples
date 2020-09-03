from django.conf import settings


def provider_logout(request):
    #  redirect_url = os.getenv('OIDC_LOGOUT_URL')
    #  import pdb
    #  pdb.set_trace()
    # return "https://dev-xelcri2d.us.auth0.com/v2/logout?returnTo=http%3A%2F%2Flocalhost%3A8000"  # redirect_url
    return "{}?returnTo=http%3A%2F%2Flocalhost%3A8000%2F".format(
        settings.OIDC_LOGOUT_URL)  # redirect_url
