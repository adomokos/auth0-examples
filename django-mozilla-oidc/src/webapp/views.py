from django.shortcuts import render
import json
from django.contrib.auth.decorators import login_required


def index(request):
    products = [
        {'title': 'PlayStation', 'price': 300, 'image':
            'https://cdn.auth0.com/blog/django-webapp/playstation.png'},
        {'title': 'iPhone', 'price': 900, 'image':
            'https://cdn.auth0.com/blog/django-webapp/iphone.png'},
        {'title': 'Yummy Pizza', 'price': 10, 'image':
            'https://cdn.auth0.com/blog/django-webapp/pizza.png'}
    ]

    context = {
        'products': products
    }

    return render(request, 'webapp/index.html', context)


@login_required
def profile(request):
    user = request.user
    #  auth0user = user.social_auth.get(provider='auth0')
    userdata = {
        'user_id': user.id,
        'name': user.first_name,
        'email': user.email
    }

    return render(request, 'webapp/profile.html', {
        'user': user,
        'userdata': json.dumps(userdata, indent=4)
    })
