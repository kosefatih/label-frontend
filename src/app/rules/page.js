"use client"
import { useState, useEffect } from "react"
import {
  getRuleSets,
  createRuleSet,
  deleteRuleSet,
  getRuleSetById,
  getRuleTypes,
  addRuleToRuleSet,
  deleteRule,
} from "../../lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppLayout } from "@/components/app-layout"
import { LoadingButton } from "@/components/loading-button"
import { FeedbackDialog } from "@/components/feedback-dialog"
import { showFeedback } from "@/lib/feedback"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function RulesPage() {
  const [ruleSets, setRuleSets] = useState([])
  const [selectedRuleSet, setSelectedRuleSet] = useState(null)
  const [rules, setRules] = useState([])
  const [ruleTypes, setRuleTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [newRuleSet, setNewRuleSet] = useState({
    name: "",
    description: "",
    labelType: 1,
  })
  const [newRule, setNewRule] = useState({
    type: "",
    param1: "",
    param2: "",
    name: "",
    description: "",
    sequenceValue: 1,
  })
  const [selectedRuleType, setSelectedRuleType] = useState(null)

  // Load rule sets
  const loadRuleSets = async () => {
    try {
      setLoading(true)
      const data = await getRuleSets()
      setRuleSets(data)
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { 
        operation: "Kural setleri yükleme",
        errorDetails: error.response?.data
      })
    } finally {
      setLoading(false)
    }
  }

  // Load rule types
  const loadRuleTypes = async () => {
    try {
      setLoading(true)
      const data = await getRuleTypes()
      setRuleTypes(data)
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { 
        operation: "Kural tipleri yükleme",
        errorDetails: error.response?.data
      })
    } finally {
      setLoading(false)
    }
  }

  // Load rules for a rule set
  const loadRules = async (ruleSet) => {
    try {
      setLoading(true)
      setSelectedRuleSet(ruleSet)
      const data = await getRuleSetById(ruleSet.id)
      setRules(data.rules || [])
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { 
        operation: "Kurallar yükleme",
        errorDetails: error.response?.data
      })
    } finally {
      setLoading(false)
    }
  }

  // Create new rule set
  const handleCreateRuleSet = async () => {
    try {
      setLoading(true)
      const response = await createRuleSet(newRuleSet)
      showFeedback("success", response.message || "Kural seti oluşturuldu", { 
        operation: "Kural seti oluşturma" 
      })
      await loadRuleSets()
      setNewRuleSet({
        name: "",
        description: "",
        labelType: 1,
      })
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { 
        operation: "Kural seti oluşturma",
        errorDetails: error.response?.data
      })
    } finally {
      setLoading(false)
    }
  }

  // Create new rule
  const handleCreateRule = async () => {
    if (!selectedRuleSet || !newRule.type) return
    
    try {
      setLoading(true)
      const ruleData = {
        type: parseInt(newRule.type),
        param1: newRule.param1,
        param2: newRule.param2,
        name: newRule.name,
        description: newRule.description,
        sequenceValue: newRule.sequenceValue
      }
      
      const response = await addRuleToRuleSet(selectedRuleSet.id, ruleData)
      
      showFeedback("success", response.message || "Kural oluşturuldu", { 
        operation: "Kural oluşturma" 
      })
      
      await loadRules(selectedRuleSet)
      setNewRule({
        type: "",
        param1: "",
        param2: "",
        name: "",
        description: "",
        sequenceValue: 1,
      })
      setSelectedRuleType(null)
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { 
        operation: "Kural oluşturma",
        errorDetails: error.response?.data
      })
    } finally {
      setLoading(false)
    }
  }

  // Delete rule set
  const handleDeleteRuleSet = async (ruleSetId) => {
    try {
      setLoading(true)
      const response = await deleteRuleSet(ruleSetId)
      showFeedback("success", response.message || "Kural seti silindi", { 
        operation: "Kural seti silme" 
      })
      await loadRuleSets()
      if (selectedRuleSet?.id === ruleSetId) {
        setSelectedRuleSet(null)
        setRules([])
      }
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { 
        operation: "Kural seti silme",
        errorDetails: error.response?.data
      })
    } finally {
      setLoading(false)
    }
  }

  // Delete rule
  const handleDeleteRule = async (ruleId) => {
    if (!selectedRuleSet) return
    
    try {
      setLoading(true)
      const response = await deleteRule(selectedRuleSet.id, ruleId)
      showFeedback("success", response.message || "Kural silindi", { 
        operation: "Kural silme" 
      })
      await loadRules(selectedRuleSet)
    } catch (error) {
      showFeedback("error", error.response?.data?.message || error.message, { 
        operation: "Kural silme",
        errorDetails: error.response?.data
      })
    } finally {
      setLoading(false)
    }
  }

  // Rule type seçildiğinde
  const handleRuleTypeSelect = (typeId) => {
    const selected = ruleTypes.find(t => t.id === parseInt(typeId))
    setSelectedRuleType(selected)
    setNewRule(prev => ({
      ...prev,
      type: typeId,
      name: selected?.name || "",
      description: selected?.description || ""
    }))
  }

  // Load data on component mount
  useEffect(() => {
    loadRuleSets()
    loadRuleTypes()
  }, [])

  return (
    <AppLayout title="Kural Yönetimi">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rule Sets Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Kural Setleri</h2>
            <FeedbackDialog
              title="Yeni Kural Seti Ekle"
              trigger={
                <Button size="sm" variant="outline">
                  Yeni Ekle
                </Button>
              }
              onConfirm={handleCreateRuleSet}
            >
              <div className="space-y-4">
                <div>
                  <Label>Ad</Label>
                  <Input
                    value={newRuleSet.name}
                    onChange={(e) => setNewRuleSet({ ...newRuleSet, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Açıklama</Label>
                  <Input
                    value={newRuleSet.description}
                    onChange={(e) => setNewRuleSet({ ...newRuleSet, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Etiket Türü</Label>
                  <Select
                    value={newRuleSet.labelType.toString()}
                    onValueChange={(value) => setNewRuleSet({ ...newRuleSet, labelType: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Etiket türü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Ader BMK</SelectItem>
                      <SelectItem value="2">Klemen BMK</SelectItem>
                      <SelectItem value="3">Device BMK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FeedbackDialog>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ruleSets.map((ruleSet) => (
                  <TableRow
                    key={ruleSet.id}
                    className={selectedRuleSet?.id === ruleSet.id ? "bg-gray-100" : ""}
                  >
                    <TableCell 
                      className="cursor-pointer hover:underline"
                      onClick={() => loadRules(ruleSet)}
                    >
                      {ruleSet.name}
                    </TableCell>
                    <TableCell>
                      {ruleSet.labelType === 1 && 'Ader BMK'}
                      {ruleSet.labelType === 2 && 'Klemen BMK'}
                      {ruleSet.labelType === 3 && 'Device BMK'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteRuleSet(ruleSet.id)}
                        disabled={loading}
                      >
                        Sil
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Rules Section */}
        {selectedRuleSet && (
          <div className="space-y-4 md:col-span-2">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {selectedRuleSet.name} - Kurallar
                <span className="text-sm text-gray-500 ml-2">
                  ({rules.length} kural)
                </span>
              </h2>
              <FeedbackDialog
                title="Yeni Kural Ekle"
                trigger={
                  <Button size="sm" variant="outline">
                    Yeni Ekle
                  </Button>
                }
                onConfirm={handleCreateRule}
              >
                <div className="space-y-4">
                  <div>
                    <Label>Kural Tipi</Label>
                    <Select onValueChange={handleRuleTypeSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kural tipi seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {ruleTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name} ({type.parameterCount} parametre)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedRuleType && (
                    <>
                      <div>
                        <Label>Kural Adı</Label>
                        <Input
                          value={newRule.name}
                          onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Açıklama</Label>
                        <Input
                          value={newRule.description}
                          onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Parametre 1</Label>
                        <Input
                          value={newRule.param1}
                          onChange={(e) => setNewRule({ ...newRule, param1: e.target.value })}
                          placeholder={selectedRuleType.parameterCount > 0 ? "Gerekli" : "Opsiyonel"}
                        />
                      </div>
                      {selectedRuleType.parameterCount > 1 && (
                        <div>
                          <Label>Parametre 2</Label>
                          <Input
                            value={newRule.param2}
                            onChange={(e) => setNewRule({ ...newRule, param2: e.target.value })}
                            placeholder="Gerekli"
                          />
                        </div>
                      )}
                      <div>
                        <Label>Sıra</Label>
                        <Input
                          type="number"
                          value={newRule.sequenceValue}
                          onChange={(e) => setNewRule({ 
                            ...newRule, 
                            sequenceValue: parseInt(e.target.value) || 1 
                          })}
                        />
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Kural Açıklaması:</h4>
                        <p className="text-sm whitespace-pre-line">{selectedRuleType.description}</p>
                      </div>
                    </>
                  )}
                </div>
              </FeedbackDialog>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sıra</TableHead>
                    <TableHead>Ad</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>Parametreler</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.sort((a, b) => a.sequenceValue - b.sequenceValue).map((rule) => {
                    const ruleType = ruleTypes.find(t => t.enumVal === rule.type) || {};
                    return (
                      <TableRow key={rule.id}>
                        <TableCell>{rule.sequenceValue}</TableCell>
                        <TableCell>
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-sm text-gray-500">{rule.description}</div>
                        </TableCell>
                        <TableCell>{ruleType.name || rule.type}</TableCell>
                        <TableCell>
                          {rule.param1 && <div>Param1: {rule.param1}</div>}
                          {rule.param2 && <div>Param2: {rule.param2}</div>}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRule(rule.id)}
                            disabled={loading}
                          >
                            Sil
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}