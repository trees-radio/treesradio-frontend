import React from "react";
import { observer } from "mobx-react";
import { observable, action } from "mobx";
import { EmojiPickerSpecialEmoji } from "../.././../libs/emoji";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import chat from "../../../stores/chat";
import profile from "../../../stores/profile";
import toast from "../../../utils/toast";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

// Max image size in bytes (2MB)
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
// Supported image types
const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/gif"];

interface ChatSendProps {
  myref: React.RefObject<HTMLInputElement | null>;
  isMobile: boolean;
}

class ChatSend extends React.Component {
  props: ChatSendProps;
  fileInputRef = React.createRef<HTMLInputElement>();
  inputWrapperRef = React.createRef<HTMLDivElement>();
  formRef = React.createRef<HTMLFormElement>();

  @observable accessor showEmojiPicker: boolean = false;
  @observable accessor uploadingImage: boolean = false;
  @observable accessor previewImage: string | null = null;
  @observable accessor isDraggingOver: boolean = false;
  @observable accessor currentFile: File | null = null;
  
  @action toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  @action setUploadingImage(value: boolean) {
    this.uploadingImage = value;
  }

  @action setPreviewImage(value: string | null) {
    this.previewImage = value;
    
    // When preview image changes, ensure input is visible
    if (value !== null) {
      // Use setTimeout to allow state to update and DOM to render
      setTimeout(() => {
        this.scrollInputIntoView();
        
        // Also focus the input after a small delay
        setTimeout(() => {
          if (this.props.myref && this.props.myref.current) {
            this.props.myref.current.focus();
          }
        }, 100);
      }, 50);
    }
  }

  @action setIsDraggingOver(value: boolean) {
    this.isDraggingOver = value;
  }

  constructor(props: ChatSendProps) {
    super(props);
    this.props = props;
    
    // Bind methods
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
    this.scrollInputIntoView = this.scrollInputIntoView.bind(this);
  }

  componentDidMount() {
    // Set up paste event listener on the input
    if (this.props.myref && this.props.myref.current) {
      this.props.myref.current.addEventListener('paste', this.handlePaste);
    }
    
    // Set up drop zone event listeners
    if (this.inputWrapperRef.current) {
      const element = this.inputWrapperRef.current;
      element.addEventListener('dragover', this.handleDragOver);
      element.addEventListener('dragleave', this.handleDragLeave);
      element.addEventListener('drop', this.handleDrop);
    }
  }
  
  componentWillUnmount() {
    // Clean up event listeners
    if (this.props.myref && this.props.myref.current) {
      this.props.myref.current.removeEventListener('paste', this.handlePaste);
    }
    
    if (this.inputWrapperRef.current) {
      const element = this.inputWrapperRef.current;
      element.removeEventListener('dragover', this.handleDragOver);
      element.removeEventListener('dragleave', this.handleDragLeave);
      element.removeEventListener('drop', this.handleDrop);
    }
  }

  // Helper method to scroll input into view
  scrollInputIntoView() {
    if (this.formRef.current) {
      // Scroll the form into view with a smooth behavior
      this.formRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end'
      });
      
      // Also make sure the window scrolls to the bottom
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
      
      // For mobile devices, this additional check helps
      if (window.innerWidth <= 768) {
        const chatContainer = document.getElementById('chatcontainer');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }
    }
  }

  onKeyPress(e: React.KeyboardEvent) {
    var key = e.keyCode || e.which;
    if (key === 13) {
      e.preventDefault();
      if (chat.mentionMatches.length > 0) {
        chat.replaceMention(0);
      } else if ((e.target as HTMLInputElement).value.length > 0) {
        this.sendMessage();
      }
    }
  }

  onKeyDown(e: React.KeyboardEvent) {
    var key = e.keyCode || e.which;
    if (key === 9) {
      if (chat.mentionMatches.length > 0) {
        e.preventDefault();
        chat.replaceMention(0);
      }
    }

    if (key === 13) {
      e.preventDefault();
      if (chat.mentionMatches.length > 0) {
        chat.replaceMention(0);
      } else if ((e.target as HTMLInputElement).value.length > 0) {
        this.sendMessage();
      }
    }

    return false;
  }

  onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!profile.user) {
      toast("You are not logged in!", { type: "error" });
    } else {
      e.preventDefault();
      chat.updateMsg(e.target.value);
    }
  }

  emojiPicked(emoji: EmojiClickData) {
    this.showEmojiPicker = false;
    if (emoji.isCustom) {
      chat.updateMsg(chat.msg + ` :${emoji.names[0]}: `);
      return;
    }
    chat.updateMsg(chat.msg + emoji.emoji);
  }

  handleImagePick = () => {
    if (this.fileInputRef.current) {
      this.fileInputRef.current.click();
    }
  }

  handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile.user) {
      toast("You are not logged in!", { type: "error" });
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;
    
    this.processImageFile(file);
  }
  
  // Handle drag over event
  handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.setIsDraggingOver(true);
  }
  
  // Handle drag leave event
  handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.setIsDraggingOver(false);
  }
  
  // Handle drop event
  handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.setIsDraggingOver(false);
    
    if (!profile.user) {
      toast("You are not logged in!", { type: "error" });
      return;
    }
    
    // Process dropped files
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Check if it's an image
      if (file.type.startsWith('image/')) {
        this.processImageFile(file);
      }
    }
  }
  
  // Handle paste event
  handlePaste = async (e: ClipboardEvent) => {
    if (!profile.user) {
      toast("You are not logged in!", { type: "error" });
      return;
    }
    
    // Check if pasted content contains images
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            // Prevent default paste behavior
            e.preventDefault();
            // Process the image (wait for it to complete)
            await this.processImageFile(file);
            return;
          }
        }
      }
    }
  }
  
  // Process image file (common function for all input methods)
  processImageFile = async (file: File) => {
    // Check file size
    if (file.size > MAX_IMAGE_SIZE) {
      toast("Image too large (max 2MB)", { type: "error" });
      return;
    }

    // Check file type
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      toast("Unsupported image format", { type: "error" });
      return;
    }

    try {
      // Resize image if needed
      const resizedFile = await this.resizeImageIfNeeded(file);
      
      this.currentFile = resizedFile;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(resizedFile);
    } catch (error) {
      console.error("Error processing image:", error);
      toast("Failed to process image", { type: "error" });
    }
  }
  
  // Resize image if dimensions exceed maximum
  resizeImageIfNeeded = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        
        const width = img.width;
        const height = img.height;
        
        // If image is within size limits, return original
        if (width <= 1200 && height <= 1200) {
          resolve(file);
          return;
        }
        
        // Calculate new dimensions
        let newWidth, newHeight;
        if (width > height) {
          newWidth = 1200;
          newHeight = Math.round(height * (1200 / width));
        } else {
          newHeight = 1200;
          newWidth = Math.round(width * (1200 / height));
        }
        
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw resized image on canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Convert to blob with quality adjustment for JPEGs
        const quality = file.type === 'image/jpeg' ? 0.85 : 1;
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create new file from blob
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(resizedFile);
            } else {
              reject(new Error("Could not create blob from canvas"));
            }
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Failed to load image for resizing"));
      };
    });
  }

  cancelImage = () => {
    this.setPreviewImage(null);
    if (this.fileInputRef.current) {
      this.fileInputRef.current.value = '';
    }
    
    // Focus back on the input after canceling
    if (this.props.myref && this.props.myref.current) {
      setTimeout(() => {
        this.props.myref.current?.focus();
      }, 10);
    }
  }

  uploadImage = async (file: File): Promise<string> => {
    const storage = getStorage();
    const userId = profile.uid || 'anonymous';
    const timestamp = Date.now();
    const uniqueId = uuidv4().substring(0, 8);
    const extension = file.name.split('.').pop();
    
    // Path format: chat_images/userId/timestamp_uniqueId.extension
    const storageRef = ref(storage, `chat_images/${userId}/${timestamp}_${uniqueId}.${extension}`);
    
    // Add expiration metadata - 6 hours from now in seconds
    const metadata = {
      customMetadata: {
        'expires_at': (Math.floor(Date.now() / 1000) + (6 * 60 * 60)).toString()
      }
    };

    return new Promise((resolve, reject) => {
      this.setUploadingImage(true);
      
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      
      uploadTask.on('state_changed',
        (snapshot) => {
          // Could add progress indication here if desired
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${progress.toFixed(2)}%`);
        },
        (error) => {
          this.setUploadingImage(false);
          reject(error);
        },
        async () => {
          // Get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          this.setUploadingImage(false);
          resolve(downloadURL);
        }
      );
    });
  }

  sendMessage = async () => {
    if (this.uploadingImage) {
      toast("Please wait for image to upload", { type: "info" });
      return;
    }

    // Handle text message
    const hasText = chat.msg.length > 0;
    
    // Handle image upload if there's a preview
    if (this.previewImage && (this.fileInputRef.current?.files?.[0] || this.currentFile)) {
      try {
        const file = this.fileInputRef.current?.files ? this.fileInputRef.current.files[0] : this.currentFile;
        if (!file) return;
        const imageUrl = await this.uploadImage(file);
        
        // Send message with image URL (embedded in the message)
        const imageTag = `[img:${imageUrl}]`;
        
        if (hasText) {
          // Send text with image
          chat.sendMsg(chat.getMsg() + ' ' + imageTag, () => {});
        } else {
          // Send just the image
          chat.sendMsg(imageTag, () => {});
        }
        
        // Reset preview
        this.setPreviewImage(null);
        this.currentFile = null;
        if (this.fileInputRef.current) {
          this.fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast("Failed to upload image", { type: "error" });
      }
    } else if (hasText) {
      // Just send the text message if no image
      chat.pushMsg();
    }
    
    profile.lastchat = Math.floor(Date.now() / 1000);
    
    // Ensure input stays visible after sending
    setTimeout(() => {
      this.scrollInputIntoView();
      
      // Focus back on input
      if (this.props.myref && this.props.myref.current) {
        this.props.myref.current.focus();
      }
    }, 100);
  }

  renderImagePreview() {
    if (!this.previewImage) return null;
    
    return (
      <div className="image-preview-container">
        <div className="image-preview-wrapper">
          <img 
            src={this.previewImage} 
            alt="Preview" 
            className="image-preview"
            onLoad={() => {
              // Ensure input is visible when image loads
              this.scrollInputIntoView();
            }}
          />
          <button 
            className="cancel-image-btn"
            onClick={this.cancelImage}
            aria-label="Cancel image"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  render() {
    var matchContainer;

    if (chat.mentionMatches.length > 0) {
      var matches = chat.mentionMatches.map((m, i) => {
        return (
          <span key={i} className="mention-item" onClick={() => chat.replaceMention(i)}>
            {" "}
            @{m}
          </span>
        );
      });
      matchContainer = <div className="mentions-container"> {matches} </div>;
    }

    const dropZoneClass = this.isDraggingOver 
      ? "input-group tr-form-group active-drop-zone" 
      : "input-group tr-form-group";

    return (
      <form 
        className={`form-inline chatbarform ${this.props.isMobile && this.previewImage ? 'bottom-2.5 relative' : ''}`} 
        id="search" 
        autoComplete="off"
        ref={this.formRef}
      >
        <EmojiPicker
          onEmojiClick={(emoji, _event) => this.emojiPicked(emoji)}
          open={this.showEmojiPicker}
          style={{ bottom: "5vh", position: "absolute"}}
          customEmojis={EmojiPickerSpecialEmoji}
          theme={Theme.DARK}
        />
        <div className={`form-group tr-form-group chatboxform`}>
          {matchContainer}
          
          {/* Image preview container */}
          <div className="preview-container">
            {this.renderImagePreview()}
          </div>
          
          <div 
            id="sendbox_test" 
            className={dropZoneClass}
            ref={this.inputWrapperRef}
          >
            <div className="flex items-center justify-center bg-white input-group-addon w-11 h-11 rounded-l-md"
              onClick={() => {
                this.toggleEmojiPicker();
              }}
            >
              🙂
            </div>
            
            {/* Image upload button */}
            <div 
              className="flex items-center justify-center bg-white input-group-addon w-11 h-11"
              onClick={this.handleImagePick}
            >
              📷
              <input 
                type="file"
                ref={this.fileInputRef}
                accept="image/jpeg,image/png,image/gif"
                style={{ display: 'none' }}
                onChange={this.handleImageSelect}
              />
            </div>
            
            <input
              ref={this.props.myref}
              type="search"
              placeholder={this.isDraggingOver ? "Drop image here" : "enter to send"}
              id="chatinput"
              autoComplete="off"
              className="bg-white rounded-l-none h-11"
              value={chat.msg}
              onKeyDown={e => this.onKeyDown(e)}
              onChange={e => this.onChange(e)}
              data-lpignore="true"
            />
            <div id="chat-counter_test" className="content-center input-group-addon w-17 h-11">
              {" "}
              {chat.chars}/{chat.limit}{" "}
            </div>
          </div>
        </div>
      </form>
    );
  }
}

export default observer(ChatSend);