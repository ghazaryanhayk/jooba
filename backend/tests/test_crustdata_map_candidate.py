"""Tests for _map_candidate pure function."""

from clients.crustdata_client import _map_candidate


def test_full_profile():
    profile = {
        'name': 'Alice',
        'headline': 'Engineer at Acme',
        'summary': 'Experienced dev',
        'profile_picture_permalink': 'https://img.example.com/alice.jpg',
        'current_employers': [
            {'title': 'Senior Engineer', 'name': 'Acme Corp'},
            {'title': 'Junior Engineer', 'name': 'OldCo'},
        ],
    }
    c = _map_candidate(profile)
    assert c.name == 'Alice'
    assert c.title == 'Senior Engineer'
    assert c.company == 'Acme Corp'
    assert c.headline == 'Engineer at Acme'
    assert c.summary == 'Experienced dev'
    assert c.avatar_url == 'https://img.example.com/alice.jpg'


def test_empty_current_employers():
    profile = {'name': 'Bob', 'headline': '', 'summary': '', 'current_employers': []}
    c = _map_candidate(profile)
    assert c.title == ''
    assert c.company == ''


def test_none_current_employers():
    profile = {'name': 'Charlie', 'headline': '', 'summary': '', 'current_employers': None}
    c = _map_candidate(profile)
    assert c.title == ''
    assert c.company == ''


def test_missing_optional_fields():
    profile = {'name': 'Dana'}
    c = _map_candidate(profile)
    assert c.headline == ''
    assert c.summary == ''
    assert c.avatar_url is None


def test_missing_name_defaults_to_empty():
    profile = {}
    c = _map_candidate(profile)
    assert c.name == ''
