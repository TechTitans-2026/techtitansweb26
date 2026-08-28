import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft } from 'lucide-react';

export default function MemberDetail() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMember();
  }, [id]);

  const fetchMember = async () => {
    setLoading(true);
    // Fetch member, their profile, and their projects
    const { data } = await supabase
      .from('members')
      .select(`
        *,
        profiles(username, email),
        project_members(
          projects(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (data) setMember(data);
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#1a1b22] text-white flex items-center justify-center font-['JetBrains_Mono'] animate-pulse">Loading Profile...</div>;
  }

  if (!member) {
    return <div className="min-h-screen bg-[#1a1b22] text-white flex items-center justify-center font-['JetBrains_Mono']">Operative not found.</div>;
  }

  const projects = member.project_members?.map(pm => pm.projects) || [];
  const currentProjects = projects.filter(p => p.status === 'current');
  const pastProjects = projects.filter(p => p.status === 'past');

  return (
    <div className="min-h-screen bg-[#1a1b22] text-white p-8 font-['Space_Grotesk']">
      <div className="max-w-4xl mx-auto">
        <Link to="/members" className="inline-flex items-center text-[#8c8d96] hover:text-[#ae97d6] mb-8 transition-colors font-['JetBrains_Mono'] text-sm">
          <ArrowLeft size={16} className="mr-2" /> RETURN TO DIRECTORY
        </Link>
        
        <div className="bg-[#21222b] rounded-2xl p-8 border border-[#ae97d6]/20 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ae97d6]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            {/* Avatar block */}
            <div className="w-32 h-32 bg-black/40 border border-[#ae97d6] rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(174,151,214,0.2)]">
               <span className="font-['Orbitron'] font-bold text-5xl text-[#ae97d6]">
                 {member.profiles?.username?.charAt(0).toUpperCase()}
               </span>
            </div>

            <div className="flex-grow">
              <h1 className="text-4xl font-bold font-['Orbitron'] mb-2">{member.profiles?.username}</h1>
              <div className="flex flex-wrap gap-4 mb-6">
                <span className="px-3 py-1 bg-[#ae97d6]/10 text-[#ae97d6] rounded text-sm font-['JetBrains_Mono']">
                  Field: {member.field || 'N/A'}
                </span>
                <span className="px-3 py-1 bg-black/40 text-gray-300 rounded text-sm font-['JetBrains_Mono']">
                  Class of {member.year || 'Unknown'}
                </span>
              </div>

              {/* Social Links */}
              <div className="flex gap-4 border-t border-[#ae97d6]/10 pt-4 mt-4">
                {member.github_url ? (
                  <a href={member.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-[#8c8d96] hover:text-white transition-colors">
                    <span className="mr-2">[GH]</span> GitHub
                  </a>
                ) : (
                  <span className="flex items-center text-gray-600"><span className="mr-2">[GH]</span> No GitHub</span>
                )}
                {member.linkedin_url ? (
                  <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-[#8c8d96] hover:text-[#0077b5] transition-colors">
                    <span className="mr-2">[LI]</span> LinkedIn
                  </a>
                ) : (
                  <span className="flex items-center text-gray-600"><span className="mr-2">[LI]</span> No LinkedIn</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Current Projects */}
          <div className="bg-[#21222b] rounded-xl p-6 border border-transparent">
            <h2 className="text-xl font-bold font-['Orbitron'] text-[#00f3ff] mb-4">ACTIVE DEPLOYMENTS</h2>
            {currentProjects.length > 0 ? (
              <ul className="space-y-4">
                {currentProjects.map(p => (
                  <li key={p.id} className="bg-black/30 p-4 rounded border border-[#00f3ff]/20">
                    <h3 className="font-bold font-['JetBrains_Mono']">{p.title}</h3>
                    <p className="text-sm text-gray-400 mt-2">{p.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[#8c8d96] text-sm">No active deployments.</p>
            )}
          </div>

          {/* Past Projects */}
          <div className="bg-[#21222b] rounded-xl p-6 border border-transparent">
            <h2 className="text-xl font-bold font-['Orbitron'] text-gray-400 mb-4">ARCHIVED LOGS</h2>
            {pastProjects.length > 0 ? (
              <ul className="space-y-4">
                {pastProjects.map(p => (
                  <li key={p.id} className="bg-black/20 p-4 rounded border border-gray-700">
                    <h3 className="font-bold text-gray-300 font-['JetBrains_Mono']">{p.title}</h3>
                    <p className="text-sm text-gray-500 mt-2">{p.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[#8c8d96] text-sm">No past records.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
