import json
import argparse
import difflib
import sys

def load_firebase_backup(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def find_uuid_fuzzy(data, username_input):
    usernames = data.get("Usernames", {})
    names = list(usernames.values())

    matches = difflib.get_close_matches(username_input, names, n=3, cutoff=0.4)
    if not matches:
        print(f"No similar usernames found for '{username_input}'")
        return None, None

    print("Possible matches:")
    for i, name in enumerate(matches):
        print(f"{i + 1}. {name}")

    try:
        selection = int(input(f"Select match [1-{len(matches)}] or 0 to cancel: "))
    except ValueError:
        print("Invalid selection.")
        return None, None

    if selection == 0:
        print("Cancelled.")
        return None, None
    if 1 <= selection <= len(matches):
        chosen_name = matches[selection - 1]
        for uuid, name in usernames.items():
            if name == chosen_name:
                return uuid, name
    print("Invalid selection.")
    return None, None

def list_user_playlists(data, uuid):
    playlists = data.get("playlists", {}).get(uuid, {})
    if not playlists:
        print(f"No playlists found for UUID {uuid}.")
        return {}
    print(f"\nPlaylists for UUID {uuid}:")
    for name, details in playlists.items():
        print(f"- {name} (ID: {details.get('id', 'N/A')})")
    return playlists

def extract_playlists(playlists, output_file='extracted_playlists.json'):
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(playlists, f, indent=2)
    print(f"\nPlaylists extracted to {output_file}")

def main():
    parser = argparse.ArgumentParser(description='Extract user playlists from Firebase JSON backup.')
    parser.add_argument('backup_path', help='Path to Firebase JSON backup file')
    parser.add_argument('username', help='Username (fuzzy match enabled)')
    args = parser.parse_args()

    try:
        data = load_firebase_backup(args.backup_path)
    except Exception as e:
        print(f"Failed to load JSON: {e}")
        sys.exit(1)

    uuid, matched_name = find_uuid_fuzzy(data, args.username)
    if not uuid:
        sys.exit(1)

    print(f"\nMatched username: {matched_name} (UUID: {uuid})")

    playlists = list_user_playlists(data, uuid)

    if playlists:
        should_extract = input("\nExtract these playlists to a file? (y/n): ").strip().lower()
        if should_extract == 'y':
            out_file = f"playlists_{matched_name}.json"
            extract_playlists(playlists, out_file)

if __name__ == "__main__":
    main()

