// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

import "hardhat/console.sol";

error Blog__InvalidTokenId(uint256 id);
error Blog__ZeroDonationNotAllowed();

contract Blog {
    /* ===== Events ===== */
    event PostCreated(uint256 id, string title, string hash);
    event PostUpdated(uint256 id, string title, string hash, bool published);
    event Donated(uint256 id, uint256 donation, address donor);

    /* ===== User defined ===== */
    struct Post {
        uint256 id;
        string title;
        string content;
        bool published;
        uint256 donation;
    }

    /* ===== State Variable ===== */
    string public name;
    address public owner;

    uint256 private _postIds;

    mapping(uint256 => Post) private idToPost;

    /* ===== Modifiers ===== */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier _exists(uint256 postId) {
        if (postId > _postIds || postId == 0) {
            revert Blog__InvalidTokenId(postId);
        }
        _;
    }

    /* ===== Functions ===== */
    constructor(string memory _name) {
        console.log("Deploying Blog with name:", _name);
        name = _name;
        owner = msg.sender;
    }

    receive() external payable {
        emit Donated(0, msg.value, msg.sender);
    }

    /** 
     @notice updates the blog name 
    */
    function updateName(string memory _name) public {
        name = _name;
    }

    /** 
     @notice updates the ownership
    */
    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    /** 
     @notice  fetches an individual post by the id
    */
    function fetchPost(uint256 id) public view returns (Post memory) {
        return idToPost[id];
    }

    /** 
     @notice  creates a new post
    */
    function createPost(string memory title, string memory hash) public onlyOwner {
        _postIds = _postIds + 1;
        uint256 postId = _postIds;
        Post storage post = idToPost[postId];
        post.id = postId;
        post.title = title;
        post.published = true;
        post.content = hash;
        emit PostCreated(postId, title, hash);
    }

    /** 
     @notice  updates an existing post 
    */
    function updatePost(
        uint256 postId,
        string memory title,
        string memory hash,
        bool published
    ) public _exists(postId) onlyOwner {
        Post storage post = idToPost[postId];
        post.title = title;
        post.published = published;
        post.content = hash;
        idToPost[postId] = post;
        emit PostUpdated(post.id, title, hash, published);
    }

    /** 
     @notice donate to post 
    */
    function donateToPost(uint256 postId) public payable _exists(postId) {
        if (msg.value <= 0) {
            revert Blog__ZeroDonationNotAllowed();
        }
        Post storage post = idToPost[postId];
        post.donation += msg.value;
        emit Donated(postId, msg.value, msg.sender);
    }

    function withdraw() public onlyOwner {
        (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");

        require(success, "Withdrawal falied");
    }
}
