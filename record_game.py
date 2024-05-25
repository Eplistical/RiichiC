#!/usr/bin/python3
import argparse 
import requests
from pprint import pprint

def parse_player_stats(arg):
  vals = arg.split(',')
  if len(vals) == 5:
    # player,pt,riichi,agari,deal_in
    return {
        "name": vals[0],
        "points": int(vals[1]),
        "riichi": int(vals[2]),
        "agari": int(vals[3]),
        "deal_in": int(vals[4]),
    }
  else:
    print(f"invalid args for player stats: {vals}")

def parse_args():
  parser = argparse.ArgumentParser(
                      prog='RecordGame',
                      description='record a game.')
  parser.add_argument('-t', '--token', type=str, required=True)
  parser.add_argument('-d', '--date', type=int, required=True)
  parser.add_argument('-E', '--east', type=parse_player_stats, required=True)
  parser.add_argument('-S', '--south', type=parse_player_stats, required=True)
  parser.add_argument('-W', '--west', type=parse_player_stats, required=True)
  parser.add_argument('-N', '--north', type=parse_player_stats, required=True)
  return parser.parse_args()

def run(args):
  URL = "https://uf7tin6si3sgnif7truyy3rrwm0kzqjd.lambda-url.us-east-2.on.aws"
  headers = {
    "Content-Type": "application/json"
  }
  game = {
    "game_date": args.date,
    "east": args.east,
    "south": args.south,
    "west": args.west,
    "north": args.north,
  }

  print("game to upload:")
  pprint(game)

  resp = requests.post(URL, json={
    "action": "record_game",
    "token": args.token,
    "game": game,
  })
  return resp.text


if __name__ == '__main__':
  args = parse_args()
  resp = run(args)
  print(resp)
