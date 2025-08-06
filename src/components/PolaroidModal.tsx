import React from "react"
import { JournalEntry } from '@/types/types'
import { Share, Share2, X } from "lucide-react";
import { Console } from "console";
import { useDispatch, useSelector } from 'react-redux';
import { addSharedPost } from '@/store/slices/journalEntrySlice';
import { api } from "@/utils/api";
import { RootState } from "@/store/store";

type PolaroidModalProps = {
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
    entry?: JournalEntry;
}

const PolaroidModal: React.FC<PolaroidModalProps> = ({ isModalOpen, setIsModalOpen, entry }) => {

    const user = useSelector((state: RootState) => state.userProfile);
    const dispatch = useDispatch();

    if (!isModalOpen || !entry) return null;

    const handleShare = async () => {
        console.log("Sharing entry:", user);
        
        // dispatch(addSharedPost({
        //     id: entry.id,
        //     caption: entry.caption,
        //     mood: entry.mood,
        //     reactions: 0,
        //     photo: entry.images,
        //     timestamp: entry.timestamp,
        // }));


        try {
            const response = await api.posts.createPost({
                username: user.user.username,
                avatar_url: user.user.avatar,
                photo: entry.images,
                mood: entry.mood,
                visibility: 'public',
                caption: entry.caption,
            });
            console.log("Post shared successfully:", response);
        } catch (error) {
            console.error("Error sharing post:", error);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 p-4 flex items-center justify-center z-50">
            <div className="bg-white shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                style={{
                    background: 'linear-gradient(to bottom, #fefefe, #f8f6f1)',
                    filter: 'sepia(5%) saturate(105%)'
                }}>

                {/* Postcard Header */}
                <div className="flex justify-between items-start p-6 pb-2">
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-serif text-gray-800 tracking-wider"
                            style={{ fontFamily: 'Georgia, serif' }}>
                            JOURNAL ENTRY
                        </h1>
                        <p className="text-sm text-gray-600 mt-1 font-mono">
                            FROM YOUR JOURNEY
                        </p>
                    </div>
                    <div className="flex gap-4 text-right">
                        <div onClick={() => handleShare()} className="font-mono bg-orange-500 px-1 flex gap-1 items-center justfy-center cursor-pointer text-white hover:bg-white hover:text-orange-500 hover:border hover:border-orange-500">
                            <p>share</p>
                            <Share2 size={16} />
                        </div>
                        <X
                            className="cursor-pointer text-gray-600 hover:text-gray-800 mt-1 ml-auto"
                            onClick={() => setIsModalOpen(false)}
                            size={20}
                        />
                    </div>
                </div>

                <div className="flex">
                    {/* Left side - Photo */}
                    <div className="w-1/2 p-6 pt-0">
                        <div className="relative overflow-hidden rounded-sm shadow-lg">
                            <img
                                src={entry.images}
                                alt="Journal entry"
                                className="w-full h-96 object-cover"
                                style={{ filter: 'contrast(1.1) brightness(1.05)' }}
                            />
                            {/* Subtle vintage overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10"></div>
                        </div>
                    </div>

                    {/* Right side - Postcard elements */}
                    <div className="w-1/2 p-6 pt-0 flex flex-col">
                        {/* Stamps area */}
                        {/* <div className="flex justify-end mb-4">
                            <div className="flex gap-2">
                                <div className="w-12 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-sm border border-gray-300 flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">10</span>
                                </div>
                                <div className="w-12 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-sm border border-gray-300 flex items-center justify-center">
                                    <span className="text-white text-xs">✉️</span>
                                </div>
                            </div>
                        </div> */}

                        {/* Postmark */}
                        <div className="flex justify-end mb-6">
                            <div className="w-16 h-16 rounded-full border-2 border-gray-400 flex items-center justify-center text-xs text-gray-600 font-mono bg-white/80">
                                <div className="text-center">
                                    <div>{new Date(entry.timestamp).toLocaleDateString('en-GB')}</div>
                                    <div className="text-[8px]">POSTMARK</div>
                                </div>
                            </div>
                        </div>

                        {/* Address lines */}
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center">
                                {/* <span className="text-sm font-mono text-gray-700 w-16">To:</span> */}
                                <div className="flex-1 border-b border-gray-300 h-4"></div>
                            </div>
                            <div className="flex items-center">
                                {/* <span className="text-sm font-mono text-gray-700 w-16">From:</span> */}
                                <div className="flex-1 border-b border-gray-300 h-4"></div>
                            </div>
                            {/* <div className="flex items-center">
                                <span className="text-sm font-mono text-gray-700 w-16">Address:</span>
                                <div className="flex-1 border-b border-gray-300 h-4"></div>
                            </div> */}
                        </div>

                        {/* Message area */}
                        <div className="flex-1">
                            <div className="border border-gray-300 rounded-sm p-4 bg-white/50 min-h-48">
                                <div className="space-y-2">
                                    <p className="text-sm font-mono text-gray-600">
                                        Mood: <span className="font-semibold text-gray-800">{entry.mood}</span>
                                    </p>
                                    <div className="border-b border-gray-200"></div>
                                    <p className="text-sm font-serif text-gray-800 italic py-2">
                                        "{entry.caption}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom signature */}
                        <div className="mt-4 text-right">
                            <p className="text-xs text-gray-500 font-mono">
                                With love from your journey ✨
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolaroidModal;