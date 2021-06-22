#!/usr/bin/env python3
# See https://docs.python.org/3.2/library/socket.html
# for a decscription of python socket and its parameters
import socket
import os
import stat
import sys
import urllib.parse
import datetime

from threading import Thread
from argparse import ArgumentParser

BUFSIZE = 4096

CRLF = '\r\n' #Sort hand for new line
METHOD_NOT_ALLOWED = 'HTTP/1.1 405  METHOD NOT ALLOWED{}Allow: GET, HEAD, POST {}Connection: close{}{}'.format(CRLF, CRLF, CRLF, CRLF)
OK_Head = 'HTTP/1.1 200 OK{}{}{}'.format(CRLF, CRLF, CRLF) # head request only
OK = 'HTTP/1.1 200 OK{}{}'.format(CRLF, CRLF)
NOT_FOUND = 'HTTP/1.1 404 NOT FOUND{}Connection: close{}{}'.format(CRLF, CRLF, CRLF)
FORBIDDEN = 'HTTP/1.1 403 FORBIDDEN{}Connection: close{}{}'.format(CRLF, CRLF, CRLF)

def get_contents(fname):
  with open(fname, 'rb') as f:
    return f.read()


def check_perms(resource):
    # Returns True if resource has read permissions set on 'others'
    stmode = os.stat(resource).st_mode
    return (getattr(stat, 'S_IROTH') & stmode) > 0

#returns what type is requested, which will be used in the response message
def get_content_type(type):
  print(type)
  if(type == 'html'):
    return "text/html"
  elif (type == 'jpg'):
    return "image/jpeg"
  elif (type == 'png'):
    return "image/png"
  elif (type == 'css'):
    return "text/css"
  elif (type == 'js'):
    return "text/javascript"
  else: 
    return "text/plain"

class HTTP_HeadServer:
  def __init__(self, host, port):
    print("Server")
    print('listening on port {}'.format(port))
    self.host = host
    self.port = port

    self.setup_socket()

    self.accept()

    self.sock.shutdown()
    self.sock.close()

  def setup_socket(self):
    self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    self.sock.bind((self.host, self.port))
    self.sock.listen(128)

  def accept(self):
    while True:
      (client, address) = self.sock.accept()
      th = Thread(target=self.accept_request, args=(client, address))
      th.start()
  
  def accept_request(self, client_sock, client_addr):
    print("accept request")
    data = client_sock.recv(BUFSIZE)
    req = data.decode('utf-8') #returns a string
    response= self.process_request(req) #returns a string
    client_sock.send(response)

    #clean up the connection to the client
    client_sock.shutdown(1)
    client_sock.close()

  def process_request(self,request):
    print('######\nREQUEST:\n{}######'.format(request))
    linelist = request.strip().split(CRLF)
    reqline = linelist[0]
    rlwords = reqline.split()

    if(len(rlwords)==0):
      return "zero words"

    if(rlwords[0] == 'HEAD'):
      resource = rlwords[1][1:] #skip beginning 
      msg = self.head_request(resource) #CALLS the head_request method

    elif(rlwords[0] == 'GET'):
      resource = rlwords[1][1:] 
      msg = self.get_request(resource)  #CALLS the get_request method

    elif(rlwords[0] == 'POST'):
      resource = rlwords[1][1:] 
      msg = self.post_request(linelist)  #CALLS the post_request method

    else:
      msg = bytes(METHOD_NOT_ALLOWED, 'utf-8')
    
    print('######\nRESPONSE:\n{}######'.format(msg))
    return msg

  # Handles Head requests
  def head_request(self, resource):
    path = os.path.join('.', resource) #look in directory where server is running
    if not os.path.exists(resource):
      ret = NOT_FOUND
    elif not check_perms(resource):
      ret = FORBIDDEN
    else:
      ret = OK_Head
    return bytes(ret, 'utf-8')
  

  # Handles Get and Redirect requests
  def get_request(self, resource):
    types = ['html', 'jpg', 'png', 'mp3', 'js', 'css']  # types that are allowed for the server
    msg = bytes('', 'utf-8') # return message with the response and content 
    path = os.path.join('.', resource)
    
    # helps to look for a redirect request
    redirect = resource.split("?")
    redirect1 = redirect[0]
    
    if not os.path.exists(resource):
      if(redirect1 == "redirect"):
        query = redirect[1].split('=')
        search_item = query[1] # what youtube search was requested
        content = "HTTP/1.1 307 TEMPORARY REDIRECT{}Location: https://www.youtube.com/results?search_query={}".format(CRLF,search_item)
        msg = bytes(content, 'utf-8') 
      
      else:
        content = get_contents('404.html')
        msg = bytes(NOT_FOUND, 'utf-8') + content
    
    else:
      if check_perms(resource):
        content_type = resource.split(".")
        content_type = content_type[1]
      
        if(content_type in types): # checks if the extension/file type is allowed
            content_type = get_content_type(content_type)
            content = get_contents(resource) # returns the right type for response message

            resp_msg = 'HTTP/1.1 200 OK{}Content-Type: {}{}{}'.format(CRLF, content_type, CRLF,CRLF)
            msg = bytes(resp_msg, 'utf-8') + content
          
      else:
        content = get_contents('403.html')
        msg = bytes(FORBIDDEN, 'utf-8') + content

    return msg

  # Handles post request 
  def post_request(self,linelists):
    form_data = linelists[len(linelists)-1]
    form_data = form_data.split('&') # Splits the form data in a array 
    form_final = [] # will store the data formated to use in the form
    for i in form_data:
        form_final.append((i.split('='))) # this puts the data into form_final

    content = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>Form submit</title><link rel=\"stylesheet\" type=\"text/css\"  href=\"mypost.css\"></head><body><h2>Following Form Data Submitted Successfully:</h2><table><tr><td><label>{}</label></td><td>{}</td></tr><tr><td><label>{}</label></td><td>{}</td></tr><tr><td><label>{}</label></td><td>{}</td></tr><tr><td><label>{}</label></td><td>{}</td></tr><tr><td><label>{}</label></td><td>{}</td></tr><tr><td><label>{}</label></td><td>{}</td></tr></table></body></html>"

    content = content.format(form_final[0][0], form_final[0][1],
                             form_final[1][0], form_final[1][1],
                             form_final[2][0], form_final[2][1],
                             form_final[3][0], form_final[3][1],
                             form_final[4][0], form_final[4][1],
                             form_final[5][0], form_final[5][1])
                             
    msg = bytes(OK + content, 'utf-8')
    return msg


def parse_args():
  parser = ArgumentParser()
  parser.add_argument('--host', type=str, default='localhost',
                      help='specify a host to operate on (default: localhost)')
  parser.add_argument('-p', '--port', type=int, default=9001,
                      help='specify a port to operate on (default: 9001)')
  args = parser.parse_args()
  return (args.host, args.port)


if __name__ == '__main__':
  (host, port) = parse_args()
  HTTP_HeadServer(host, port)