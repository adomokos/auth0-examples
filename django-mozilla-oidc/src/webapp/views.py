from django.shortcuts import render

# Create your views here.


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
