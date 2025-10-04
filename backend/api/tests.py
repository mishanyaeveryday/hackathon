from django.test import TestCase
from rest_framework.test import APITestCase
from django.urls import reverse
from api.models import User
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
import uuid
# Create your tests here.


class TestUserAPI(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            username='admin', password='adminpass')
        refresh = RefreshToken.for_user(self.admin_user)
        self.access_token = str(refresh.access_token)
        self.refresh_token = str(refresh)

        self.test_user = User.objects.create_user(
            username='test_user', password='userpass')

    def test_get_users(self):
        url = reverse('get-users')
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(User.objects.filter().exists())

    def test_get_users_without_jwt(self):
        url = reverse('get-users')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_user_success(self):
        # testing exist user
        url = reverse('get-user', kwargs={'pk': self.admin_user.pk})
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'],
                         self.admin_user.username)

    def test_get_user_not_found(self):
        # testing non-exist user
        url = reverse('get-user', kwargs={'pk': uuid.uuid4()})
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_login_success(self):
        url = reverse('login-user')
        data = {"username": "admin", "password": "adminpass"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_invalid_credentials(self):
        url = reverse('login-user')
        data = {"username": "test", "password": "testpass"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout(self):
        url_login = reverse('login-user')
        data = {"username": "admin", "password": "adminpass"}
        response = self.client.post(url_login, data, format="json")
        url_logout = reverse('logout-user')
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        response = self.client.post(
            url_logout,  {"refresh": response.data['refresh']}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
