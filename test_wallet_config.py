import importlib


def test_apple_pass_uses_provided_base_url():
    loyalty = importlib.import_module('loyalty')
    payload = loyalty._generate_apple_pass_json(
        tenant_slug='demo',
        tenant_name='Demo',
        card={'id': 1, 'name': 'Stempelkarte', 'stamps_required': 10, 'reward_name': 'Kaffee', 'color_hex': '#C9A84C'},
        customer={'pass_serial': 'serial-123', 'current_stamps': 2, 'short_code': 'A7K2', 'last_message': 'Hallo', 'msg_nonce': 0},
        base_url='https://example.test',
    )

    assert payload['webServiceURL'] == 'https://example.test/api/wallet/apple'
    assert payload['storeCard']['backFields'][4]['value'].startswith('https://example.test/')


def test_google_class_uses_provided_base_url():
    loyalty = importlib.import_module('loyalty')
    payload = loyalty._generate_google_class_payload(
        tenant_slug='demo',
        tenant_name='Demo',
        card={'id': 1, 'name': 'Stempelkarte', 'reward_name': 'Kaffee', 'color_hex': '#C9A84C'},
        logo_url='https://cdn.example/logo.png',
        base_url='https://example.test',
    )

    assert payload['callbackOptions']['updateUrl'] == 'https://example.test/api/wallet/google/callback'
